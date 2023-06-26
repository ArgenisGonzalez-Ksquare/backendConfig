import { Controller, handleServerError } from "@/libraries/Controller";
import { Request, Response } from "express";
import { Announcement } from "@/db/models/Announcement/model/Announcement";
import { Audience } from "../db/models/Audience/model/Audience";
import { User } from "../db/models/User/model/User";
import { Icons } from "@/db/models/Icons/model/Icons";
import { Group } from "../db/models/Group/model/Group";
import { parseWhere } from "@/libraries/ModelController";

export const findAnouccementAll = async (req: Request, res: Response) => {
  try {
    const {
      byGroup,
      shouldIncludeIcon,
      shouldIncludeAudience,
      ...where
    } = parseWhere(req);

    const whereAudience =
      typeof byGroup === "boolean" ? { where: { byGroup } } : {};

    const includedIcon = shouldIncludeIcon
      ? [{ attributes: ["name", "url"], model: Icons }]
      : [];

    const includedAudience = shouldIncludeAudience
      ? [
          {
            attributes: ["userId", "groupId", "byGroup"],
            model: Audience,
            include: [
              { attributes: ["id", "name", "email"], model: User },
              { attributes: ["id", "name"], model: Group },
            ],
            ...whereAudience,
          },
        ]
      : [];

    const annouccement = await Announcement.findAll({
      where: where,
      attributes: ["name", "status", "date"],
      include: [...includedIcon, ...includedAudience],
    });
    return Controller.ok(res, annouccement);
  } catch (err) {
    handleServerError(err, res);
  }
};
