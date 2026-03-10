import { useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FretePreviewModal } from "@/components/ui/FreteModalPreview";

// Modal de Preview que criaremos abaixo

const Frete = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]); // Dados do banco
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colunas da Tabela Principal
  const columns = [
    {
      key: "nf", // Adicione a propriedade key
      accessorKey: "nf",
      header: "NF",
    },
    {
      key: "fatura", // Adicione a propriedade key
      accessorKey: "fatura",
      header: "Fatura",
      cell: ({ row }: any) => row.original.fatura || "---",
    },
    {
      key: "status", // Adicione a propriedade key
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge variant={row.original.pago ? "default" : "secondary"}>
          {row.original.pago ? "Pago" : "Pendente"}
        </Badge>
      ),
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        // Simulação de Validação: Aqui você compararia com seu banco de dados
        const processed = rawData.map((row: any) => {
          const nfStr = String(row.NF || row.nf || "");
          const existeNoBanco = data.find((v) => v.nf === nfStr);

          return {
            nf: nfStr,
            fatura: row.FATURA || row.fatura || "",
            jaPago: existeNoBanco?.pago || false,
            encontrado: !!existeNoBanco,
          };
        });

        setPreviewData(processed);
      } catch (err) {
        toast.error("Erro ao ler planilha de frete.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <AppLayout title="Conciliação de Frete">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Gestão de Fretes
            </h2>
            <p className="text-muted-foreground">
              Importe suas faturas de frete para conciliação.
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Subir Planilha Frete
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </div>

        {/* Tabela Principal */}
        <div className="bg-white border rounded-xl shadow-sm">
          <DataTable
            columns={columns}
            data={data}
            // emptyMessage="Nenhum frete registrado ainda."
          />
        </div>
      </div>

      {/* Modal de Validação/Preview */}
      {previewData && (
        <FretePreviewModal
          data={previewData}
          onClose={() => {
            setPreviewData(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          onConfirm={async () => {
            // Lógica para salvar no banco
            toast.success("Fretes processados com sucesso!");
            setPreviewData(null);
          }}
        />
      )}
    </AppLayout>
  );
};

export default Frete;
