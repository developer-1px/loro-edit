// src/plugins/image.tsx

import React, { useState } from "react";
import type { Plugin } from "./types";
import type { ImageElement } from "../types";
import { useEditorStore } from "../store/editorStore";

interface EditableImageProps {
  src?: string;
  alt?: string;
  className?: string;
  elementId: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  className,
  elementId,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const handleImageChange = useEditorStore((state) => state.handleImageChange);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleImageChange(elementId, e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
          return;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're actually leaving the element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleImageUpload(files[0]);
    }
  };

  return (
    <div className={`${className} relative group`} data-element-id={elementId}>
      {src ? (
        <img
          src={src}
          alt={alt || "Editable image"}
          className="block"
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          style={{ outline: "none" }}
        />
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg text-center flex items-center justify-center ${
            dragOver ? "border-blue-500 bg-blue-50" : ""
          }`}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          style={{ aspectRatio: "auto", minHeight: "auto" }}
        >
          <div className="text-gray-400 p-4">
            <svg
              className="mx-auto w-8 h-8"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

    </div>
  );
};

export const imagePlugin: Plugin = {
  name: "image",
  version: "1.0.0",
  description: "Handles image elements with drag & drop upload capabilities",

  selectable: {
    enabled: true,
    name: "Image",
    color: "#f59e0b", // amber
    description: "Image with upload capabilities",
    level: "element",
    elementType: "inline",
  },

  match: (element: Element) => {
    return (
      element.tagName.toLowerCase() === "img" ||
      element.tagName.toLowerCase() === "picture"
    );
  },

  parse: (element: Element) => {
    if (
      element.tagName.toLowerCase() === "img" ||
      element.tagName.toLowerCase() === "picture"
    ) {
      const img =
        element.tagName.toLowerCase() === "img"
          ? (element as HTMLImageElement)
          : element.querySelector("img");
      return {
        type: (element.tagName.toLowerCase() === "picture"
          ? "picture"
          : "img") as "img" | "picture",
        id: element.id || crypto.randomUUID(),
        tagName: element.tagName.toLowerCase(),
        src: img?.getAttribute("src") || "",
        alt: img?.alt || "",
        repeatItem: element.getAttribute("data-repeat-item") || undefined,
        attributes: Array.from(element.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return null;
  },

  render: ({ parsedElement }) => {
    const imageElement = parsedElement as ImageElement;

    return (
      <EditableImage
        key={imageElement.id}
        elementId={imageElement.id}
        src={imageElement.src}
        alt={imageElement.alt}
        className={imageElement.attributes?.class || ""}
      />
    );
  },
};
