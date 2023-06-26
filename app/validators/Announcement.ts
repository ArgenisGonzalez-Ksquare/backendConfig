import { AnnouncementStatusType } from "@/db/models/Announcement/types/AnnouncementType";
import Joi from "joi";

export const AnnouncementSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required(),
  icon: Joi.number().integer(),
  status: Joi.string().valid(
    AnnouncementStatusType.Published,
    AnnouncementStatusType.Scheduled,
  ),
  date: Joi.date(),
  createdBy: Joi.number().integer(),
  updateBy: Joi.number().integer(),
  audience: Joi.number().integer(),
  duration: Joi.number().integer(),
  link: Joi.string()
    .min(1)
    .max(150)
    .required(),
});
