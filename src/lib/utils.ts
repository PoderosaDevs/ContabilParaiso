import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export class ExcelParser {
  static parseFileToJson(bstr: any): any[] {
    const wb = XLSX.read(bstr, { type: "binary" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws);
  }

  static excelDateToJS(serial: any): string {
    if (!serial) return "";
    if (typeof serial === "string") {
      const parts = serial.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        return new Date(Date.UTC(y, m - 1, d, 8, 0, 0)).toISOString();
      }
      return serial.trim();
    }
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 8, 0, 0)).toISOString();
  }

  static parseCurrency(v: any): number {
    if (typeof v === "number") return v;
    if (!v) return 0;
    return parseFloat(
      String(v)
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    ) || 0;
  }

  static getCellValue(item: any, possibleNames: string[]): any {
    const keys = Object.keys(item);
    for (const name of possibleNames) {
      const foundKey = keys.find(k => k.trim().toUpperCase() === name.toUpperCase());
      if (foundKey) return item[foundKey];
    }
    return "";
  }
}