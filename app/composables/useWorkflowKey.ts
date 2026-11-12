import { requestKey } from '../utils/request-key';
/** Keep the same key for retries of an unchanged request, including lost responses. */
export function useWorkflowKey() {
  let last = '';
  let key = '';
  return (input: unknown) => {
    const fingerprint = JSON.stringify(input);
    if (fingerprint !== last || !key) {
      last = fingerprint;
      key = requestKey();
    }
    return key;
  };
}
