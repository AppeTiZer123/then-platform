"use server";

import { reportRepo } from "@/lib/db/repositories";
import postgres from "postgres";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLegacyRow(row: any): Report {
  return {
    id: row.id ?? String(row.case_number ?? Math.random()),
    caseNumber: row.case_number ?? "",
    reporterName: row.reporter_name ?? "",
    reporterPhone: row.reporter_phone ?? null,
    incidentDate: row.incident_date ?? null,
    incidentDetails: row.incident_details ?? row.details ?? null,
    damageAmount: row.damage_amount != null ? String(row.damage_amount) : null,
    status: row.status ?? null,
    createdAt: row.created_at ? new Date(row.created_at) : null,
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    idCard: row.id_card ?? row.id_card_encrypted ?? row.idcard ?? null,
    transferAmount:
      row.transfer_amount ??
      row.amount ??
      (row.damage_amount != null ? String(row.damage_amount) : null),
    productOrdered: row.product_ordered ?? row.product ?? row.item ?? null,
    accountNumber:
      row.account_number ?? row.bank_account ?? row.suspect_account ?? null,
    sellerPage: row.seller_page ?? row.page ?? null,
    transferDate: row.transfer_date ?? row.paid_at ?? null,
    postDate: row.post_date ?? row.posted_at ?? null,
    moreDetails: row.additional_details ?? row.more_details ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRepoResult(r: any): Report {
  return {
    id: r.id ?? r.caseNumber ?? r.case_number ?? String(Math.random()),
    caseNumber: r.caseNumber ?? r.case_number ?? "",
    reporterName: r.reporterName ?? r.reporter_name ?? "",
    reporterPhone: r.reporterPhone ?? r.reporter_phone ?? null,
    incidentDate: r.incidentDate ?? r.incident_date ?? null,
    incidentDetails: r.incidentDetails ?? r.incident_details ?? null,
    damageAmount: r.damageAmount ?? r.damage_amount ?? null,
    status: r.status,
    createdAt: r.createdAt ?? r.created_at,
    updatedAt: r.updatedAt ?? r.updated_at,
    idCard: r.idCard ?? r.id_card ?? r.id_card_encrypted ?? null,
    transferAmount:
      r.transferAmount ??
      r.transfer_amount ??
      r.damageAmount ??
      r.damage_amount ??
      null,
    productOrdered: r.productOrdered ?? r.product_ordered ?? r.product ?? null,
    accountNumber:
      r.accountNumber ??
      r.account_number ??
      r.bank_account ??
      r.suspect_account ??
      null,
    sellerPage: r.sellerPage ?? r.seller_page ?? r.page ?? null,
    transferDate: r.transferDate ?? r.transfer_date ?? r.paid_at ?? null,
    postDate: r.postDate ?? r.post_date ?? r.posted_at ?? null,
    moreDetails:
      r.moreDetails ?? r.additional_details ?? r.more_details ?? null,
  };
}

export async function getAllReports(): Promise<Report[]> {
  try {
    // Try Drizzle reports table first
    const results = await reportRepo.getAll();

    if (Array.isArray(results) && results.length > 0) {
      return results.map(mapRepoResult);
    }

    // Fallback: try legacy then_app.fraud_reports table (raw query)
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, cannot query legacy fraud_reports");
      return [];
    }

    const sql = postgres(process.env.DATABASE_URL, { prepare: false });
    try {
      const rows = await sql`
        SELECT case_number, reporter_name, reporter_phone, incident_date, incident_details, damage_amount
        FROM then_app.fraud_reports
        ORDER BY incident_date DESC
      `;
      try {
        await sql.end();
      } catch {
        /* ignore */
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rows.map((r: any, i: number) => {
        const mapped = mapLegacyRow(r);
        mapped.id = `${mapped.caseNumber}__${i}`;
        return mapped;
      });
    } catch (err) {
      console.error("Legacy query failed:", err);
      try {
        await sql.end();
      } catch {
        /* ignore */
      }
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  try {
    const result = await reportRepo.findById(id);

    if (result) return mapRepoResult(result);

    // Fallback to legacy table
    if (!process.env.DATABASE_URL) return null;
    const sql = postgres(process.env.DATABASE_URL, { prepare: false });
    try {
      const rows = await sql`
        SELECT case_number, reporter_name, reporter_phone, incident_date, incident_details, damage_amount
        FROM then_app.fraud_reports
        WHERE case_number = ${id}
        LIMIT 1
      `;
      try {
        await sql.end();
      } catch {
        /* ignore */
      }
      if (rows && rows.length > 0) {
        const mapped = mapLegacyRow(rows[0]);
        mapped.id = mapped.id ?? mapped.caseNumber;
        return mapped;
      }
      return null;
    } catch (err) {
      console.error("Legacy getById failed:", err);
      try {
        await sql.end();
      } catch {
        /* ignore */
      }
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch report by id:", error);
    return null;
  }
}
