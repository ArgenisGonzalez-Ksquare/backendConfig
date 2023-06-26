import { config } from "./config";
import { Policy } from "./db/models/Policy/model/Policy";
import { Role } from "./db/models/Role/model/Role";
import { RoleNames } from "./db/models/Role/types/RoleNames.type";
import { User } from "./db/models/User/model/User";

async function createDefaultPoliciesAndUsers() {
  // Admin role is only for system maintenance
  const adminRole = await Role.create({
    name: RoleNames.ADMIN,
    description: "Has access to everything",
    isDefault: false,
  });

  // Normal roles:
  const employeeRole = await Role.create({
    name: RoleNames.EMPLOYEE,
    description: "Has access to Employee stuff",
    isDefault: true,
  });

  /*
    About Permissions:
      - For default CRUD permissions, the first part of the permission name
      should match with the Controfler "name" (the base url for the controller).
      - Also, for the permissions to work, the Controller default CRUD endpoints
      should have the AuthMiddleware.
      - For custom endpoints, you have to define custom permissions and use the hasCustomPermission middleware.
      (CRUD permissions have the format: <controller name>.<property|*>.<c|r|u|d|*>)
      (Custom permissions don't have any "." in their name)
  */
  const adminPolicy = await Policy.create({
    name: "Admin",
    description: "Has access to everything",
    isSystemManaged: true,
    permission: {
      "departments.*.*": true,
      "file.*.*": true,
      "profile.*.*": true,
      "region.*.*": true,
      "role.*.*": true,
      "self-users": true,
      "user.*.r": true,
    },
  });

  const employeePolicy = await Policy.create({
    name: "Employee Policy",
    description: "Has access to employee features",
    permission: {
      "departments.*.r": true,
      "file.*.r": true,
      "profile.*.r": true,
      "region.*.r": true,
      "self-users": true,
      "user.*.r": true,
    },
  });

  await adminRole.addPolicy(adminPolicy.id);
  await employeeRole.addPolicy(employeePolicy.id);

  const admin = await User.create({
    name: "Jose Admon",
    firstName: "Jose",
    lastName: "Admon",
    email: "admin@example.com",
    password: config.email.defaultPassword,
    isActive: true,
    isEmailConfirmed: true,
    uid_azure: "dsdsXSDE1502",
  });
  await admin.addRole(adminRole.id);

  const group = await Group.create({
    name: "Test",
    createdBy: adminRole.id,
    updatedBy: adminRole.id,
  });
  await admin.addGroup(group.id);

  const employee = await User.create({
    name: "John Smith",
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    password: config.email.defaultPassword,
    isActive: true,
    isEmailConfirmed: true,
    uid_azure: "3244SRRTERF",
  });
  await employee.addRole(employeeRole.id);
  await employee.addGroup(group.id);

  const admin3 = await User.create({
    name: "Test Admin",
    firstName: "Test",
    lastName: "Admin",
    email: "admin3@correooo.com",
    password: config.email.defaultPassword,
    isActive: true,
    isEmailConfirmed: true,
    uid_azure: "",
  });
  await admin3.addRole(adminRole.id);

  const admin2 = await User.create({
    name: "Pedro Admin",
    firstName: "Pedro",
    lastName: "Admin",
    email: "admin2@example.com",
    password: config.email.defaultPassword,
    isActive: true,
    isEmailConfirmed: true,
    uid_azure: "",
  });
  await admin2.addRole(adminRole.id);

  // Creates first admin user
  const count = await User.count();
  if (count === 0) {
    await createDefaultPoliciesAndUsers();
  }
}
