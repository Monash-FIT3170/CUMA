import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import User from '../api/models/UserSchema.js'
import { sendApprovalEmail, sendRejectionEmail } from '../api/utils/auth-utils.js'

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
})

class CustomUserResource extends AdminJSMongoose.Resource {
  static _isUserResource = true;

  constructor(model) {
    super(model);
  }

  properties() {
    const properties = super.properties();
    return properties.filter(property => {
      if (property.name() === 'connections') return false;
      if (property.name().startsWith('additional_info.')) {
        return (params) => {
          const value = params[property.name()];
          return value !== null && value !== undefined && value !== '';
        };
      }
      return true;
    });
  }
}

const adminJsOptions = {
  resources: [{
    resource: new CustomUserResource(User),
    options: {
      listProperties: ['firstName', 'lastName', 'email', 'askingRole', 'status'],
      filterProperties: ['status'],
      showProperties: [
        'firstName', 'lastName', 'email', 'askingRole', 'status',
        'additional_info.dateOfBirth', 'additional_info.university', 'additional_info.major', 
        'additional_info.department', 'additional_info.faculty', 'additional_info.professionalTitle', 
        'additional_info.studentId', 'additional_info.staffId'
      ],
      actions: {
        approve: {
          actionType: 'record',
          icon: 'CheckCircle',
          handler: async (request, response, context) => {
            const { record, currentAdmin } = context;
            await record.update({ status: 'active' });
            const { firstName, lastName, email, askingRole } = record.params;
            await sendApprovalEmail(email, firstName, lastName, askingRole);
            return {
              record: record.toJSON(currentAdmin),
              notice: { message: `${firstName} ${lastName} has been approved and sent an email`, type: 'success' }
            };
          }
        },
        reject: {
          actionType: 'record',
          icon: 'XCircle',
          handler: async (request, response, context) => {
            const { record, currentAdmin } = context;
            await record.update({ status: 'rejected' });
            const { firstName, lastName, email, askingRole } = record.params;
            await sendRejectionEmail(email, firstName, lastName, askingRole);
            return {
              record: record.toJSON(currentAdmin),
              notice: { message: `${firstName} ${lastName} has been rejected and sent an email`, type: 'danger' }
            };
          }
        }
      },
      filters: {
        status: {
          filter: (query) => {
            return { ...query, status: 'pending_verification' }
          },
        },
      },
    }
  }],
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