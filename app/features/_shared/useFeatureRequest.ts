import { shallowRef, ref, onScopeDispose, getCurrentScope } from 'vue';
import { normalizeApiError, type ApiError } from '../../api/errors';
/** Per-component/request state. Latest request wins; cancellation never becomes success. */
export function useFeatureRequest<T, A>(
  operation: (argument: A, signal: AbortSignal) => Promise<T>,
) {
  const status = ref<'idle' | 'loading' | 'success' | 'error' | 'cancelled'>('idle');
  const data = shallowRef<T>();
  const error = shallowRef<ApiError>();
  let controller: AbortController | undefined;
  let generation = 0;
  function cancel() {
    generation++;
    controller?.abort();
    if (status.value === 'loading') status.value = 'cancelled';
  }
  async function execute(argument: A): Promise<T | undefined> {
    cancel();
    const current = generation;
    controller = new AbortController();
    const signal = controller.signal;
    data.value = undefined;
    error.value = undefined;
    status.value = 'loading';
    try {
      const result = await operation(argument, signal);
      if (current !== generation || signal.aborted) return;
      data.value = result;
      status.value = 'success';
      return result;
    } catch (cause) {
      if (current !== generation) return;
      error.value = normalizeApiError(cause, signal);
      status.value = error.value.kind === 'cancelled' ? 'cancelled' : 'error';
    }
  }
  function reset() {
    cancel();
    data.value = undefined;
    error.value = undefined;
    status.value = 'idle';
  }
  if (getCurrentScope()) onScopeDispose(cancel);
  return { status, data, error, execute, cancel, reset };
}
