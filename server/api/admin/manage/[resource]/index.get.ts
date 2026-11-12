import { managedResource, managedRecords, paginateRecords } from '../../../../utils/management-api';
export default defineEventHandler(async (event) =>
  paginateRecords(event, await managedRecords(managedResource(event))),
);
