import { Business } from "../../domain.layer/models/business";
import { User } from "../../domain.layer/models/user";
import { Category } from "../../domain.layer/models/category";
import { Optional } from "sequelize";
import IBusiness from "../../domain.layer/interfaces/business";

type BusinessCreationAttributes = Optional<IBusiness, "id" | "createdAt" | "updatedAt" | "deletedAt" | "description" | "category_id" | "cover_image">;
type BusinessUpdateAttributes = Partial<Omit<IBusiness, "id" | "createdAt" | "updatedAt" | "deletedAt">>;

const defaultIncludes = [
  {
    model: User,
    attributes: ['id', 'firstname', 'lastname', 'email']
  },
  {
    model: Category,
    attributes: ['id', 'name', 'slug', 'icon'],
    required: false,
  }
];

export async function getAllBusinessesQuery() {
  return await Business.findAll({
    include: defaultIncludes,
  });
}

export async function getBusinessByIdQuery(id: number) {
  return await Business.findByPk(id, {
    include: defaultIncludes,
  });
}

export async function getBusinessesByOwnerQuery(ownerId: number) {
  return await Business.findAll({
    where: { owner: ownerId },
    include: defaultIncludes,
  });
}

export async function createBusinessQuery(businessData: BusinessCreationAttributes) {
  return await Business.create(businessData);
}

export async function updateBusinessQuery(id: number, businessData: BusinessUpdateAttributes) {
  const business = await Business.findByPk(id);
  if (!business) {
    return null;
  }

  await business.update(businessData);
  return await Business.findByPk(id, {
    include: defaultIncludes,
  });
}

export async function deleteBusinessQuery(id: number) {
  const business = await Business.findByPk(id);
  if (!business) {
    return null;
  }

  await business.destroy();
  return business;
}

export async function getActiveBusinessesQuery() {
  return await Business.findAll({
    where: { is_active: true },
    include: defaultIncludes,
  });
}
