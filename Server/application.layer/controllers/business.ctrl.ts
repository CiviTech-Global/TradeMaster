import { Request, Response, NextFunction } from "express";
import { InternalError } from "../../infrastructure.layer/errors/app-error";
import {
  getAllBusinessesQuery,
  getBusinessByIdQuery,
  getBusinessesByOwnerQuery,
  createBusinessQuery,
  updateBusinessQuery,
  deleteBusinessQuery,
  getActiveBusinessesQuery
} from "../../infrastructure.layer/utils/business.util";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";
import { logger } from "../../infrastructure.layer/utils/logger.util";
import { recordSuccess } from "../../application.layer/services/audit.service";
import IBusiness from "../../domain.layer/interfaces/business";

export async function getAllBusinesses(req: Request, res: Response, next: NextFunction) {
  try {
    const businesses = await getAllBusinessesQuery();
    res.json({ data: businesses, message: "Businesses retrieved successfully" });
  } catch (error) {
    logger.error("BUSINESS", "Error fetching businesses", error);
    next(new InternalError("Failed to get all businesses"));
  }
}

export async function getBusinessById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const businessId = parseInt(id, 10);

    if (isNaN(businessId)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    const business = await getBusinessByIdQuery(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json({ data: business, message: "Business retrieved successfully" });
  } catch (error) {
    logger.error("BUSINESS", "Error fetching business", error);
    next(new InternalError("Failed to get business"));
  }
}

export async function getBusinessesByOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { ownerId } = req.params;
    const ownerIdNum = parseInt(ownerId, 10);

    if (isNaN(ownerIdNum)) {
      return res.status(400).json({ error: "Invalid owner ID" });
    }

    const businesses = await getBusinessesByOwnerQuery(ownerIdNum);
    res.json({ data: businesses, message: "Owner businesses retrieved successfully" });
  } catch (error) {
    logger.error("BUSINESS", "Error fetching owner businesses", error);
    next(new InternalError("Failed to get owner businesses"));
  }
}

export async function createBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { owner, title, longitude, latitude, address, emails, phones, is_active, logo, description, category_id, cover_image } = req.body;

    if (!owner || !title || longitude === undefined || latitude === undefined || !address) {
      return res.status(400).json({
        error: "Missing required fields: owner, title, longitude, latitude, address"
      });
    }

    if (!Array.isArray(emails) || !Array.isArray(phones)) {
      return res.status(400).json({
        error: "emails and phones must be arrays"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: `Invalid email format: ${email}` });
      }
    }

    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    for (const phone of phones) {
      if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
        return res.status(400).json({ error: `Invalid phone format: ${phone}` });
      }
    }

    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: "Longitude must be a number between -180 and 180" });
    }

    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: "Latitude must be a number between -90 and 90" });
    }

    const newBusiness = await createBusinessQuery({
      owner,
      title,
      longitude,
      latitude,
      address,
      emails,
      phones,
      is_active: is_active !== undefined ? is_active : true,
      logo: logo || '',
      description: description || null,
      category_id: category_id || null,
      cover_image: cover_image || null,
    });

    recordSuccess(
      { actorId: owner, action: "business:created", resource: "business", resourceId: newBusiness.id },
      req
    );

    res.status(201).json({
      data: newBusiness,
      message: "Business created successfully"
    });
  } catch (error) {
    logger.error("BUSINESS", "Error creating business", error);
    next(new InternalError("Failed to create business"));
  }
}

export async function updateBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const businessId = parseInt(id, 10);

    if (isNaN(businessId)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    const { title, longitude, latitude, address, emails, phones, is_active, logo, description, category_id, cover_image } = req.body;

    if (!title && longitude === undefined && latitude === undefined && !address &&
        !emails && !phones && is_active === undefined && !logo && description === undefined && category_id === undefined && cover_image === undefined) {
      return res.status(400).json({
        error: "At least one field must be provided for update"
      });
    }

    const updateData: Partial<IBusiness> = {};

    if (title) updateData.title = title;
    if (longitude !== undefined) {
      const lonValue = typeof longitude === 'number' ? longitude : parseFloat(longitude);
      if (isNaN(lonValue) || lonValue < -180 || lonValue > 180) {
        return res.status(400).json({ error: "Longitude must be a valid number between -180 and 180" });
      }
      updateData.longitude = lonValue;
    }
    if (latitude !== undefined) {
      const latValue = typeof latitude === 'number' ? latitude : parseFloat(latitude);
      if (isNaN(latValue) || latValue < -90 || latValue > 90) {
        return res.status(400).json({ error: "Latitude must be a valid number between -90 and 90" });
      }
      updateData.latitude = latValue;
    }
    if (address) updateData.address = address;
    if (emails) {
      if (!Array.isArray(emails)) {
        return res.status(400).json({ error: "emails must be an array" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of emails) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: `Invalid email format: ${email}` });
        }
      }
      updateData.emails = emails;
    }
    if (phones) {
      if (!Array.isArray(phones)) {
        return res.status(400).json({ error: "phones must be an array" });
      }
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      for (const phone of phones) {
        if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ''))) {
          return res.status(400).json({ error: `Invalid phone format: ${phone}` });
        }
      }
      updateData.phones = phones;
    }
    if (is_active !== undefined) updateData.is_active = is_active;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (cover_image !== undefined) updateData.cover_image = cover_image;

    const updatedBusiness = await updateBusinessQuery(businessId, updateData);
    if (!updatedBusiness) {
      return res.status(404).json({ error: "Business not found" });
    }

    recordSuccess(
      {
        actorId: req.user?.id,
        action: "business:updated",
        resource: "business",
        resourceId: businessId,
        diff: updateData as Record<string, unknown>,
      },
      req
    );

    res.json({ data: updatedBusiness, message: "Business updated successfully" });
  } catch (error) {
    logger.error("BUSINESS", "Error updating business", error);
    next(new InternalError("Failed to update business"));
  }
}

export async function deleteBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const businessId = parseInt(id, 10);

    if (isNaN(businessId)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    const deletedBusiness = await deleteBusinessQuery(businessId);
    if (!deletedBusiness) {
      return res.status(404).json({ error: "Business not found" });
    }

    recordSuccess(
      { actorId: req.user?.id, action: "business:deleted", resource: "business", resourceId: businessId },
      req
    );

    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    logger.error("BUSINESS", "Error deleting business", error);
    next(new InternalError("Failed to delete business"));
  }
}

export async function getActiveBusinesses(req: Request, res: Response, next: NextFunction) {
  try {
    const businesses = await getActiveBusinessesQuery();
    res.json({ data: businesses, message: "Active businesses retrieved successfully" });
  } catch (error) {
    logger.error("BUSINESS", "Error fetching active businesses", error);
    next(new InternalError("Failed to get active businesses"));
  }
}