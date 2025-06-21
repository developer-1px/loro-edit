// src/plugins/image.tsx

import React, { useState } from "react";
import type { Plugin } from "./types";
import type { ImageElement } from "../types";

interface EditableImageProps {
  src?: string;
  alt?: string;
  onImageChange: (newSrc: string) => void;
  className?: string;
  elementId: string;
}

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  onImageChange,
  className,
  elementId,
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageChange(e.target.result as string);
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
          className="transition-all duration-200 group-hover:opacity-75"
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          tabIndex={0}
          style={{ outline: "none" }}
        />
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg text-center transition-all duration-200 hover:border-gray-400 focus:border-blue-500 focus:outline-none flex items-center justify-center ${
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

      {src && (
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded"></div>
      )}
    </div>
  );
};

export const imagePlugin: Plugin = {
  name: "image",
  version: "1.0.0",
  description: "Handles image elements with drag & drop upload capabilities",

  match: {
    condition: (element) =>
      element.type === "img" || element.type === "picture",
    priority: 90,
  },

  parse: (element: Element) => {
    if (element.tagName === "IMG" || element.tagName === "PICTURE") {
      const img =
        element.tagName === "IMG"
          ? (element as HTMLImageElement)
          : element.querySelector("img");
      return {
        type: (element.tagName.toLowerCase() === "picture"
          ? "picture"
          : "img") as "img" | "picture",
        id: element.id || crypto.randomUUID(),
        className: element.className || "",
        tagName: element.tagName.toLowerCase(),
        src: img?.src || "",
        alt: img?.alt || "",
        repeatItem: element.getAttribute("data-repeat-item") || undefined,
      };
    }
    return null;
  },

  render: ({ element, context }) => {
    const imageElement = element as ImageElement;

    return (
      <EditableImage
        key={imageElement.id}
        elementId={imageElement.id}
        src={imageElement.src}
        alt={imageElement.alt}
        className={imageElement.className}
        onImageChange={(newSrc) =>
          context.handleImageChange(imageElement.id, newSrc)
        }
      />
    );
  },
};
