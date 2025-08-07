"use client";
import PageHeader from "@/components/Page-header";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Upload, FileText, AlertCircle, PhoneCall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Utility to parse vars
const parseTemplateVariables = (template) => {
  const regex = /\{#(.*?)#\}/g;
  const out = [];
  let match;
  while ((match = regex.exec(template))) {
    out.push(match[1]);
  }
  return out;
};
const replaceTemplateVariables = (template, values) => {
  // Replace {#var#} with value if filled, else show the placeholder {#var#}
  let i = 0;
  return template.replace(/\{#(.*?)#\}/g, (_, name) => {
    if (values[i] && values[i].trim() !== "") {
      return values[i++];
    } else {
      i++;
      return `{#${name}#}`;
    }
  });
};

export default function MarkettingPage() {
  const { toast } = useToast();
  const [numbers, setNumbers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState([]);
  const [sendLoading, setSendLoading] = useState(false);
  const fileInput = useRef(null);

  // Fetch templates once numbers are extracted!
  useEffect(() => {
    if (numbers.length > 0) {
      setTemplates([]);
      setTemplateError(null);
      setTemplatesLoading(true);
      fetch("/api/get-templates?dltHeader=ZIRAAT")
        .then((r) => r.json())
        .then((data) => {
          if (data.ZIRAAT && Array.isArray(data.ZIRAAT)) {
            setTemplates(data.ZIRAAT);
          } else {
            setTemplateError("No templates found");
          }
        })
        .catch((e) => {
          setTemplateError("Failed to fetch templates");
          toast({
            title: "Error",
            description: e.message || "Failed to fetch templates.",
            className: "bg-red-500 text-white border border-red-700",
          });
        })
        .finally(() => setTemplatesLoading(false));
    }
  }, [numbers, toast]);

  // File upload handler
  const handleFiles = useCallback(
    (file) => {
      if (!file) return;
      setIsUploading(true);
      setNumbers([]);
      setSelectedTemplate(null);
      setTemplateVariables([]);
      const isExcel = file.name.endsWith(".xls") || file.name.endsWith(".xlsx");
      const reader = new FileReader();
      reader.onload = (e) => {
        let nums = [];
        try {
          if (isExcel) {
            const workbook = XLSX.read(e.target.result, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            nums = data
              .map((row) =>
                row && row[0] !== undefined && row[0] !== null
                  ? String(row[0]).trim()
                  : ""
              )
              .filter((val) => !!val);
          } else {
            const lines = e.target.result.split(/\r?\n/);
            nums = lines
              .map((line) => line.split(",")[0]?.trim())
              .filter((val) => !!val);
          }
        } catch (error) {
          console.error("Error parsing file:", error);
          toast({
            title: "Parse Error",
            description: "Could not parse the file.",
            className: "bg-red-500 text-white border border-red-700",
          });
          setIsUploading(false);
          return;
        }
        if (!nums.length) {
          toast({
            title: "No numbers found",
            description: "No data found in first column.",
            className: "bg-orange-500 text-white border border-orange-700",
          });
          setIsUploading(false);
          setNumbers([]);
          return;
        }
        setNumbers(nums);
        toast({
          title: "Success",
          description: `Extracted ${nums.length} values.`,
          className: "bg-green-500 text-white border border-green-700",
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({
          title: "Read Error",
          description: "Failed to read the file.",
          className: "bg-red-500 text-white border border-red-700",
        });
        setIsUploading(false);
      };
      if (isExcel) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    },
    [toast]
  );
  // triggered by input[type=file]
  function handleFileChange(e) {
    handleFiles(e.target.files[0]);
    e.target.value = "";
  }
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFiles(file);
  }
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  function clearAll() {
    setNumbers([]);
    setSelectedTemplate(null);
    setTemplateVariables([]);
    toast({
      title: "Cleared",
      description: "Cleared numbers and template.",
      className: "bg-blue-500 text-white border border-blue-700",
    });
  }
  // --------- Template selection & variable fields logic -------------
  const onTemplateSelect = (templateId) => {
    const temp = templates.find((t) => t.template_id === templateId);
    setSelectedTemplate(temp);
    setTemplateVariables(
      temp
        ? new Array(parseTemplateVariables(temp.template).length).fill("")
        : []
    );
  };
  const onVariableChange = (idx, val) => {
    setTemplateVariables((prev) => prev.map((v, i) => (i === idx ? val : v)));
  };

  // --------- Send SMS ----------
  const sendSMS = async () => {
    if (!selectedTemplate || !numbers.length) return;
    const varLabels = parseTemplateVariables(selectedTemplate.template);
    for (let i = 0; i < varLabels.length; ++i) {
      if (!templateVariables[i] || templateVariables[i].trim() === "") {
        toast({
          title: "Missing Input",
          description: `Please fill "${varLabels[i]}" field.`,
          className: "bg-orange-500 text-white border border-orange-700",
        });
        return;
      }
    }
    const numbersStr = numbers.join(",");
    const payload = {
      header: "ZIRAAT",
      template_id: selectedTemplate.template_id,
      numbers: numbersStr,
      variables_values: templateVariables,
    };
    setSendLoading(true); // <-- Set loading
    try {
      const res = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        toast({
          title: "SMS Sent",
          description: "Messages sent successfully!",
          className: "bg-green-500 text-white border border-green-700",
        });
        setSelectedTemplate(null);
        setTemplateVariables([]);
        setNumbers([]); // <--- clear numbers list
      } else {
        throw new Error(result?.error || "Failed to send SMS");
      }
    } catch (e) {
      toast({
        title: "Send Error",
        description: e?.message || "Failed to send SMS.",
        className: "bg-red-500 text-white border border-red-700",
      });
    } finally {
      setSendLoading(false); // <-- Done loading
    }
  };

  // ----- Render:
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <PageHeader title="Marketing" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Box */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Excel/CSV
            </h2>
            <p className="text-gray-600 mb-6">
              Upload a CSV or Excel file. All numbers in the{" "}
              <strong>first column</strong> will be listed below.
            </p>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-400 transition-colors cursor-pointer"
              tabIndex={0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInput.current?.click()}
              style={{ outline: "none" }}
            >
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-lg font-medium text-gray-900">
                  {isUploading ? "Processing..." : "Click or drag and drop"}
                </span>
                <span className="text-sm text-gray-500 block mt-1">
                  XLS, XLSX, or CSV
                </span>
                <input
                  ref={fileInput}
                  id="csv-upload"
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                  tabIndex={-1}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span>Only the first 50 numbers will be extracted.</span>
            </div>
          </div>
        </div>

        {/* Numbers grid + Template Section */}
        {numbers.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Extracted Numbers ({numbers.length})
              </h3>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
              {numbers.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">{item}</span>
                </div>
              ))}
            </div>

            {/* Template select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select SMS Template
              </label>
              <Select
                value={selectedTemplate?.template_id || ""}
                onValueChange={onTemplateSelect}
                disabled={templatesLoading || !!templateError}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      templatesLoading
                        ? "Loading templates..."
                        : templateError
                          ? templateError
                          : "Choose template"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.template_id} value={t.template_id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* If template selected, show preview and inputs */}
            {selectedTemplate && (
              <div className="space-y-4">
                {parseTemplateVariables(selectedTemplate.template).length >
                  0 && (
                  <div>
                    <div className="font-medium mb-2 text-gray-700">
                      Variables
                    </div>
                    {parseTemplateVariables(selectedTemplate.template).map(
                      (label, idx) => (
                        <div key={idx} className="mb-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            {label}
                          </label>
                          <Input
                            type="text"
                            value={templateVariables[idx] || ""}
                            onChange={(e) =>
                              onVariableChange(idx, e.target.value)
                            }
                            placeholder={`Enter ${label}`}
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                    {replaceTemplateVariables(
                      selectedTemplate.template,
                      templateVariables
                    )}
                  </div>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  disabled={
                    sendLoading ||
                    !selectedTemplate ||
                    parseTemplateVariables(selectedTemplate.template).some(
                      (_, idx) =>
                        !templateVariables[idx] ||
                        templateVariables[idx].trim() === ""
                    )
                  }
                  onClick={sendSMS}
                >
                  {sendLoading ? "Sending..." : "Send SMS"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {numbers.length === 0 && !isUploading && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data</h3>
            <p className="text-gray-600">
              Upload a file to see first column values here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
