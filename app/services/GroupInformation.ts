import { Group } from "@/db/models/Group/model/Group";
import { User } from "@/db/models/User/model/User";
import {
  Controller,
  ControllerErrors,
  handleServerError,
  parseId,
} from "@/libraries/Controller";
import { Request, Response } from "express";

export const getGroupbyId = async (req: Request, res: Response) => {
  try {
    const id = parseId(req);

    if (!id) {
      return Controller.badRequest(res, { message: "Missing id" });
    }
    const group = await Group.findByPk(id, {
      attributes: ["id", "name", "createdBy", "updatedBy", "is_active"],
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "firstName",
            "lastName",
            "uid_azure",
            "email",
          ],
        },
      ],
    });

    if (!group) {
      throw ControllerErrors.NOT_FOUND;
    } else {
      return Controller.ok(res, group);
    }
  } catch (err) {
    handleServerError(err, res);
  }
};
