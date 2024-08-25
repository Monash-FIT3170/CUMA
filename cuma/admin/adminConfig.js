import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import PendingStudent  from '../api/models/PendingStudentModel.js'
import PendingCourseDirector from '../api/models/PendingCourseDirectorModel.js'

AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  })

  const pendingStudentsOptions = {
    resource: PendingStudent,
    options: {
      listProperties: ['studentID', 'email', 'firstName', 'lastName', 'university', 'applicationStatus'],
      actions: {
        approve: {
          actionType: 'record',
          icon: 'CheckCircle',
          component: false,
          handler: async (request, response, context) => {
            const { record, currentAdmin } = context;
            await record.update({ applicationStatus: 'approved' });
            const name = `${record.params.firstName} ${record.params.lastName}`;
            return {
              record: record.toJSON(currentAdmin),
              notice: { message: `${name} has been approved and sent an email`, type: 'success' }
            };
          }
        },
        reject: {
          actionType: 'record',
          icon: 'XCircle',
          component: false,
          handler: async (request, response, context) => {
            const { record, currentAdmin } = context;
            await record.update({ applicationStatus: 'rejected' });
            const name = `${record.params.firstName} ${record.params.lastName}`;
            return {
              record: record.toJSON(currentAdmin),
              notice: { message: `${name} has been rejected and sent an email`, type: 'danger' }
            };
          }
        }
      }
    }
  };
  
  const pendingCourseDirectorOptions = {
    resource: PendingCourseDirector,
    options: {
      listProperties: ['staffID', 'email', 'firstName', 'lastName', 'university', 'applicationStatus'],
      actions: {
        approve: {
          actionType: 'record',
          icon: 'CheckCircle',
          component: false,
          handler: async (request, response, context) => {
            const { record, currentAdmin } = context;
            await record.update({ applicationStatus: 'approved' });
            const name = `${record.params.firstName} ${record.params.lastName}`;
            return {
              record: record.toJSON(currentAdmin),
              notice: { message: `${name} has been approved and sent an email`, type: 'success' }
            };
          }
        },
        reject: {
          actionType: 'record',
          icon: 'XCircle',
          component: false,
          handler: async (request, response, context) => {
            const { record, currentAdmin } = context;
            await record.update({ applicationStatus: 'rejected' });
            const name = `${record.params.firstName} ${record.params.lastName}`;
            return {
              record: record.toJSON(currentAdmin),
              notice: { message: `${name} has been rejected and sent an email`, type: 'danger' }
            };
          }
        }
      }
    }
  };
const adminJsOptions = {
  resources: [pendingStudentsOptions, pendingCourseDirectorOptions],
  rootPath: '/admin',
  branding: {
      companyName: 'Cuma Admin',
      softwareBrothers: false,
      logo: false
  },
}

export const setupAdminJS = async (app) => {
  const admin = new AdminJS(adminJsOptions)
  admin.watch()

  const adminRouter = AdminJSExpress.buildRouter(admin)

  app.use(admin.options.rootPath, adminRouter)

  return admin
}