import { Request, Response } from "express";
import {
  getAllBusinessesQuery,
  getBusinessByIdQuery,
  getBusinessesByOwnerQuery,
  createBusinessQuery,
  updateBusinessQuery,
  deleteBusinessQuery,
  getActiveBusinessesQuery
} from "../../infrastructure.layer/utils/business.util";
import IBusiness from "../../domain.layer/interfaces/business";

export async function getAllBusinesses(req: Request, res: Response) {
  try {
    const businesses = await getAllBusinessesQuery();
    res.json({ data: businesses, message: "Businesses retrieved successfully" });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ error: "Failed to get all businesses" });
  }
}

export async function getBusinessById(req: Request, res: Response) {
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
    console.error("Error fetching business:", error);
    res.status(500).json({ error: "Failed to get business" });
  }
}

export async function getBusinessesByOwner(req: Request, res: Response) {
  try {
    const { ownerId } = req.params;
    const ownerIdNum = parseInt(ownerId, 10);

    if (isNaN(ownerIdNum)) {
      return res.status(400).json({ error: "Invalid owner ID" });
    }

    const businesses = await getBusinessesByOwnerQuery(ownerIdNum);
    res.json({ data: businesses, message: "Owner businesses retrieved successfully" });
  } catch (error) {
    console.error("Error fetching owner businesses:", error);
    res.status(500).json({ error: "Failed to get owner businesses" });
  }
}

export async function createBusiness(req: Request, res: Response) {
  try {
    const { owner, title, longitude, latitude, address, emails, phones, is_active, logo } = req.body;

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
      logo: logo || ''
    });

    res.status(201).json({
      data: newBusiness,
      message: "Business created successfully"
    });
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
}

export async function updateBusiness(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const businessId = parseInt(id, 10);

    if (isNaN(businessId)) {
      return res.status(400).json({ error: "Invalid business ID" });
    }

    const { title, longitude, latitude, address, emails, phones, is_active, logo } = req.body;

    if (!title && longitude === undefined && latitude === undefined && !address &&
        !emails && !phones && is_active === undefined && !logo) {
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

    const updatedBusiness = await updateBusinessQuery(businessId, updateData);
    if (!updatedBusiness) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json({ data: updatedBusiness, message: "Business updated successfully" });
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ error: "Failed to update business" });
  }
}

export async function deleteBusiness(req: Request, res: Response) {
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

    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ error: "Failed to delete business" });
  }
}

export async function getActiveBusinesses(req: Request, res: Response) {
  try {
    const businesses = await getActiveBusinessesQuery();
    res.json({ data: businesses, message: "Active businesses retrieved successfully" });
  } catch (error) {
    console.error("Error fetching active businesses:", error);
    res.status(500).json({ error: "Failed to get active businesses" });
  }
}