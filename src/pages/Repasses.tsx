import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  mockRepasses as initialRepasses,
  mockMarketplaces as initialMarketplaces,
  mockVendas as initialVendas,
} from "@/data/mockData";
import { Repasse, Marketplace, Venda } from "@/types";
import { toast } from "sonner";

import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* =========================
   UTILS
========================= */

// normaliza texto (remove acento, espaço, case)
const normalize = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

// busca coluna ignorando variações
const getCol = (row: any, names: string[]) => {
  const keys = Object.keys(row);
  for (const name of names) {
    const target = normalize(name);
    const found = keys.find((k) => normalize(k) === target);
    if (found) return row[found];
  }
  return undefined;
};

// converte valor BR para number
const parseValorBR = (valor: any): number => {
  if (valor === undefined || valor === null) return 0;

  const cleaned = String(valor)
    .replace(/[^\d,.\-]/g, "")
    .trim();

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;

  return Number(normalized) || 0;
};

const Repasses = () => {
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);

  const [testePlanilhaOpen, setTestePlanilhaOpen] = useState(false);
  const [recebimentoFile, setRecebimentoFile] = useState<File | null>(null);
  const [repasseFile, setRepasseFile] = useState<File | null>(null);

  useEffect(() => {
    setRepasses(initialRepasses);
    setMarketplaces(initialMarketplaces);
    setVendas(initialVendas);
  }, []);

  /* =========================
     PROCESSAMENTO
  ========================= */
  const processarPlanilhasXLSX = async () => {
    if (!recebimentoFile || !repasseFile) {
      toast.error("Envie as duas planilhas");
      return;
    }

    console.clear();
    console.log("=== INÍCIO DA CONCILIAÇÃO ===");

    const readWorkbook = async (file: File) => {
      const data = await file.arrayBuffer();
      return XLSX.read(data);
    };

    const wbReceb = await readWorkbook(recebimentoFile);
    const wbRep = await readWorkbook(repasseFile);

    const recebimentos = XLSX.utils.sheet_to_json<any>(
      wbReceb.Sheets[wbReceb.SheetNames[0]]
    );
    const repasses = XLSX.utils.sheet_to_json<any>(
      wbRep.Sheets[wbRep.SheetNames[0]]
    );

    console.log("Recebimentos lidos:", recebimentos.length);
    console.log("Repasses lidos:", repasses.length);

    /* 1️⃣ Inicializa RECEBIMENTO */
    const recebimentoMap: Record<
      string,
      { linha: any; saldo: number }
    > = {};

    recebimentos.forEach((row, idx) => {
      const nf = String(
        getCol(row, ["NF", "Nota Fiscal"])
      ).trim();

      const liquido = parseValorBR(
        getCol(row, [
          "LIQUIDO A RECEBER",
          "LÍQUIDO A RECEBER",
          "LIQUIDO_RECEBER",
        ])
      );

      if (!nf) {
        console.warn(`Recebimento linha ${idx + 1} sem NF`);
        return;
      }

      recebimentoMap[nf] = {
        linha: { ...row },
        saldo: liquido,
      };
    });

    console.log(
      "NFs únicas em recebimento:",
      Object.keys(recebimentoMap).length
    );

    /* 2️⃣ Percorre REPASSE linha por linha */
    let subtracoes = 0;
    let repassesIgnorados = 0;

    repasses.forEach((row, idx) => {
      const nf = String(
        getCol(row, ["NF", "Nota Fiscal"])
      ).trim();

      const valorRepasse = parseValorBR(
        getCol(row, [
          "LIQUIDO A RECEBER",
          "LÍQUIDO A RECEBER",
          "LIQUIDO_RECEBER",
        ])
      );

      if (!nf) {
        console.warn(`Repasse linha ${idx + 1} sem NF`);
        return;
      }

      if (!recebimentoMap[nf]) {
        repassesIgnorados++;
        console.warn(
          `Repasse ignorado (NF não existe no recebimento): ${nf}`
        );
        return;
      }

      const antes = recebimentoMap[nf].saldo;
      recebimentoMap[nf].saldo -= valorRepasse;
      if (recebimentoMap[nf].saldo < 0) {
        recebimentoMap[nf].saldo = 0;
      }

      subtracoes++;
      console.log(
        `NF ${nf}: ${antes} - ${valorRepasse} = ${recebimentoMap[nf].saldo}`
      );
    });

    console.log("Subtrações realizadas:", subtracoes);
    console.log("Repasses ignorados:", repassesIgnorados);

    /* 3️⃣ Atualiza RECEBIMENTO */
    const recebimentoAtualizado = Object.values(recebimentoMap).map(
      ({ linha, saldo }) => ({
        ...linha,
        Situacao: saldo === 0 ? "Pago" : "Pendente",
        "Saldo Pendente": saldo,
      })
    );

    /* 4️⃣ Gera Excel */
    const ws = XLSX.utils.json_to_sheet(recebimentoAtualizado);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recebimento Atualizado");
    XLSX.writeFile(wb, "recebimento_atualizado.xlsx");

    console.log("=== FIM DA CONCILIAÇÃO ===");
    toast.success("Planilha atualizada. Verifique o console para logs.");
    setTestePlanilhaOpen(false);
  };

  return (
    <AppLayout title="Repasses">
      <div className="flex gap-2 mb-6">
        <Button variant="outline" onClick={() => setTestePlanilhaOpen(true)}>
          Teste de planilha
        </Button>
      </div>

      <DataTable data={repasses} columns={[]} emptyMessage="-" />

      <Dialog open={testePlanilhaOpen} onOpenChange={setTestePlanilhaOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Atualizar planilha de recebimento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Planilha de Recebimento (.xlsx)
              </label>
              <Input
                type="file"
                accept=".xlsx"
                onChange={(e) =>
                  setRecebimentoFile(e.target.files?.[0] || null)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Planilha de Repasse (.xlsx)
              </label>
              <Input
                type="file"
                accept=".xlsx"
                onChange={(e) =>
                  setRepasseFile(e.target.files?.[0] || null)
                }
              />
            </div>

            <Button onClick={processarPlanilhasXLSX}>
              Processar e baixar Excel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Repasses;
