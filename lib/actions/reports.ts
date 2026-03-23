"use server";

import { reportRepo } from "@/lib/db/repositories";

type Report = {
  id: string;
  caseNumber: string;
  reporterName: string;
  reporterPhone?: string | null;
  incidentDate?: string | null;
  incidentDetails?: string | null;
  damageAmount?: string | null;
  status?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  // Additional fields that may exist in legacy table or new schema
  idCard?: string | null;
  transferAmount?: string | null;
  productOrdered?: string | null;
  accountNumber?: string | null;
  sellerPage?: string | null;
  transferDate?: string | null;
  postDate?: string | null;
  moreDetails?: string | null;
};

type LegacyRow = Record<string, unknown>;

function mapRepoResult(r: LegacyRow): Report {
  return {
    id: String(r.id ?? r.caseNumber ?? r.case_number ?? Math.random()),
    caseNumber: String(r.caseNumber ?? r.case_number ?? ""),
    reporterName: String(r.reporterName ?? r.reporter_name ?? ""),
    reporterPhone:
      (r.reporterPhone as string) ?? (r.reporter_phone as string) ?? null,
    incidentDate:
      (r.incidentDate as string) ?? (r.incident_date as string) ?? null,
    incidentDetails:
      (r.incidentDetails as string) ?? (r.incident_details as string) ?? null,
    damageAmount:
      (r.damageAmount as string) ?? (r.damage_amount as string) ?? null,
    status: (r.status as string) ?? null,
    createdAt: (r.createdAt as Date) ?? (r.created_at as Date) ?? null,
    updatedAt: (r.updatedAt as Date) ?? (r.updated_at as Date) ?? null,
    idCard:
      (r.idCard as string) ??
      (r.id_card as string) ??
      (r.id_card_encrypted as string) ??
      null,
    transferAmount:
      (r.transferAmount as string) ??
      (r.transfer_amount as string) ??
      (r.damageAmount as string) ??
      (r.damage_amount as string) ??
      null,
    productOrdered:
      (r.productOrdered as string) ??
      (r.product_ordered as string) ??
      (r.product as string) ??
      null,
    accountNumber:
      (r.accountNumber as string) ??
      (r.account_number as string) ??
      (r.bank_account as string) ??
      (r.suspect_account as string) ??
      null,
    sellerPage:
      (r.sellerPage as string) ??
      (r.seller_page as string) ??
      (r.page as string) ??
      null,
    transferDate:
      (r.transferDate as string) ??
      (r.transfer_date as string) ??
      (r.paid_at as string) ??
      null,
    postDate:
      (r.postDate as string) ??
      (r.post_date as string) ??
      (r.posted_at as string) ??
      null,
    moreDetails:
      (r.moreDetails as string) ??
      (r.additional_details as string) ??
      (r.more_details as string) ??
      null,
  };
}

export async function getAllReports(): Promise<Report[]> {
  try {
    const results = await reportRepo.getAll();
    return results.map(mapRepoResult);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const result = await reportRepo.findById(id);
    if (!result) return null;
    return mapRepoResult(result as LegacyRow);
  } catch (error) {
    console.error("Failed to fetch report by id:", error);
    return null;
  }
}
