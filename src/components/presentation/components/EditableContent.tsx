import React, { useState, useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import AIContextMenu from "./AIContextMenu";

interface EditableContentProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

const EditableContent: React.FC<EditableContentProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "Click to edit",
  style = {},
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const contentRef = useRef<HTMLElement>(null);
  const html = useRef(value);

  useEffect(() => {
    html.current = value;
  }, [value]);

  const handleChange = (evt: any) => {
    html.current = evt.target.value;
    onChange(evt.target.value);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setMenuPosition({ x: e.clientX, y: e.clientY });
      setShowMenu(true);
    }
  };

  const handleApplyAI = (result: string) => {
    // Replace the selected text with the AI result
    if (contentRef.current) {
      const newValue = html.current.replace(selectedText, result);
      html.current = newValue;
      onChange(newValue);
    }
  };

  return (
    <>
      <ContentEditable
        innerRef={contentRef}
        html={html.current}
        onChange={handleChange}
        className={`outline-none ${className} ${!value ? "text-gray-400" : ""}`}
        onContextMenu={handleContextMenu}
        //@ts-ignore
        placeholder={placeholder}
        style={style}
      />

      {showMenu && (
        <AIContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          selectedText={selectedText}
          onClose={() => setShowMenu(false)}
          onApplyAI={handleApplyAI}
        />
      )}
    </>
  );
};

export default EditableContent;
