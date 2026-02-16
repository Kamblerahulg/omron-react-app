import ReactJson from "@microlink/react-json-view";

interface JsonEditorProps {
  data: any;
  onChange?: (updatedData: any) => void;
  readOnly?: boolean;
}

export default function JsonEditor({
  data,
  onChange,
  readOnly = true,
}: JsonEditorProps) {
  if (!data) return <p>No JSON selected</p>;

  const handleChange = (e: any) => {
    onChange?.(e.updated_src);
  };

  return (
    <ReactJson
      src={data}
      theme="rjv-default"
      enableClipboard
      collapseStringsAfterLength={50}
      displayDataTypes={false}
      displayObjectSize

      /* 🔥 Editing only when NOT readOnly */
      onEdit={!readOnly ? handleChange : false}
      onAdd={!readOnly ? handleChange : false}
      onDelete={!readOnly ? handleChange : false}
    />
  );
}
