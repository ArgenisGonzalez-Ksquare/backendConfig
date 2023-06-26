import { GroupMembers } from "@/db/models/GroupMembers/model/GroupMembers";
import { Group } from "@/db/models/Group/model/Group";
import {
  Controller,
  handleServerError,
  parseBody,
  parseQuery,
} from "@/libraries/Controller";
import { Request, Response } from "express";
import sequelize, { Sequelize, Op } from "sequelize";
import { User } from "@/db/models/User/model/User";

export const createGroupMember = async (req: Request, res: Response) => {
  try {
    const { group_id, member_id, is_active } = parseBody(req);

    if (!group_id || !member_id) {
      return Controller.badRequest(res, { message: "Information is missing" });
    }

    const existIn = await GroupMembers.findAll({
      where: {
        group_id: group_id,
        member_id: member_id,
      },
    });

    if (existIn.length !== 0) {
      return Controller.badRequest(res, {
        message: "this member already exits in this group",
      });
    }

    const groupMembers = await GroupMembers.create({
      group_id,
      member_id,
      is_active,
    });

    return Controller.created(res, groupMembers);
  } catch (err) {
    handleServerError(err, res);
  }
};

export const createMultGroupMember = async (req: Request, res: Response) => {
  try {
    const { name, createdBy, members } = parseBody(req);
    if (!name || !createdBy || !members) {
      return Controller.badRequest(res, { message: "Information is missing" });
    }
    //Search if the name that have been provide is free for use
    const nameExistIn = await Group.findAll({
      where: {
        name: {
          [Op.iLike]: name, //this is for not make difference between lowercase and uppercase
        },
      },
    });

    //if the name has been used before then error
    if (nameExistIn.length !== 0) {
      return Controller.conflict(res, {
        message: "This group name already exits",
      });
    }
    //first created the group
    const groupCreated = await Group.create({
      name: name,
      createdBy: createdBy,
    });

    const { id } = groupCreated;
    const uniqueMembers = new Set(members.map(member => member.member_id)); // delete duplicate members_id
    //make a copy and add the propery GROUP_ID
    const membersToInsert = [...uniqueMembers].map(member_id => ({
      member_id,
      group_id: id,
    }));
    //make a bulkcreation
    await GroupMembers.bulkCreate(membersToInsert, { ignoreDuplicates: true });
    return Controller.created(res);
  } catch (err) {
    handleServerError(err, res);
  }
};

export const deleteGroupMember = async (req: Request, res: Response) => {
  try {
    const { group_id, member_id } = parseQuery(req);
    if (!group_id || !member_id) {
      return Controller.badRequest(res, { message: "Information is missing" });
    }
    const existIn = await GroupMembers.findAll({
      where: {
        group_id: group_id,
        member_id: member_id,
      },
    });

    if (existIn.length === 0) {
      return Controller.badRequest(res, {
        message: "This member doesnt exits in this group",
      });
    }
    await GroupMembers.destroy({
      where: {
        group_id: group_id,
        member_id: member_id,
      },
    });

    return Controller.noContent(res);
  } catch (err) {
    handleServerError(err, res);
  }
};

export const findAllGroupsWithCont = async (req: Request, res: Response) => {
  try {
    const result = await Group.findAll({
      attributes: [
        "id",
        "name",
        "createdBy",
        "updatedBy",
        "is_active",
        [sequelize.fn("COUNT", "name"), "totalMembers"],
      ],
      include: [
        {
          attributes: [],
          model: GroupMembers,
          required: true,
        },
      ],
      where: {
        is_active: true,
      },
      group: ["Group.id", "userGroup.group_id"],
    });
    return Controller.ok(res, result);
  } catch (err) {
    handleServerError(err, res);
  }
};

export const findAllIfNotExits = async (req: Request, res: Response) => {
  try {
    const { group_id } = parseQuery(req);
    const usersNotInGroup = await User.findAll({
      where: {
        id: {
          [Op.notIn]: Sequelize.literal(
            `(SELECT member_id FROM public.group_members WHERE group_id = ${group_id})`,
          ),
        },
      },
    });
    return Controller.ok(res, usersNotInGroup);
  } catch (err) {
    handleServerError(err, res);
  }
};

export const addMultiGroupMember = async (req: Request, res: Response) => {
  try {
    const { id, members } = parseBody(req);
    if (!id || !members) {
      return Controller.badRequest(res, { message: "Information is missing" });
    }
    //Search if the name that have been provide is free for use
    const groupExist = await Group.findByPk(id);

    //if the name has been used before then error
    if (!groupExist) {
      return Controller.conflict(res, {
        message: "The group does not exit",
      });
    }
    const existingMembers = await GroupMembers.findAll({
      where: { group_id: id },
    });

    const uniqueMembers = new Set(members.map(member => member.member_id)); // delete duplicate members_id
    const ExistingMembers = existingMembers.map(member => member.member_id); // delete duplicate members_id

    //TODO: change the any on filter
    const uniqueAllMembers = [...uniqueMembers].filter(function(el: any) {
      return !ExistingMembers.includes(el);
    });

    if (uniqueAllMembers.length === 0) {
      return Controller.conflict(res, {
        message: "The members already in the group",
      });
    }

    //make a copy and add the propery GROUP_ID
    const membersToInsert = uniqueAllMembers.map(member_id => ({
      member_id,
      group_id: id,
    }));
    //make a bulkcreation
    await GroupMembers.bulkCreate(membersToInsert, { ignoreDuplicates: true });
    return Controller.created(res);
  } catch (err) {
    handleServerError(err, res);
  }
};
