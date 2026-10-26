/* MIT License
 *
 * Copyright (c) 2023 Angelo Verlain, Chris Davis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * SPDX-License-Identifier: MIT
 */

import { INote, ITag, Note } from "./util.js";

export function noteToMarkdown(note: Note): string {
  const data = note.toJSON();
  const frontmatterObj = {
    v: data.v,
    uuid: data.uuid,
    title: data.title,
    style: data.style,
    tags: data.tags,
    modified: new Date(data.modified).toISOString(),
    width: data.width,
    height: data.height,
    open: data.open,
  };

  const yamlLines = [
    "---",
    `v: ${frontmatterObj.v}`,
    `uuid: ${JSON.stringify(frontmatterObj.uuid)}`,
    `title: ${JSON.stringify(frontmatterObj.title)}`,
    `style: ${frontmatterObj.style}`,
    `tags: ${JSON.stringify(frontmatterObj.tags)}`,
    `modified: ${JSON.stringify(frontmatterObj.modified)}`,
    `width: ${frontmatterObj.width}`,
    `height: ${frontmatterObj.height}`,
    `open: ${frontmatterObj.open}`,
    "---",
  ];

  return `${yamlLines.join("\n")}\n${data.content}`;
}

export function markdownToNoteData(text: string): Partial<INote> {
  const normalized = text.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return {
      content: text,
    };
  }

  const [, frontmatterRaw, content] = match;
  const frontmatterData: Record<string, any> = {};

  const lines = frontmatterRaw.split("\n");
  let currentKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1 && !line.substring(0, colonIndex).includes(" ")) {
      const key = line.substring(0, colonIndex).trim();
      const rawVal = line.substring(colonIndex + 1).trim();
      currentKey = key;

      if (rawVal.length > 0) {
        try {
          frontmatterData[key] = JSON.parse(rawVal);
        } catch {
          if (rawVal === "true") frontmatterData[key] = true;
          else if (rawVal === "false") frontmatterData[key] = false;
          else if (!isNaN(Number(rawVal)) && rawVal !== "") frontmatterData[key] = Number(rawVal);
          else frontmatterData[key] = rawVal.replace(/^["']|["']$/g, "");
        }
      } else {
        frontmatterData[key] = null;
      }
    }
  }

  const res: Partial<INote> = {
    content: content,
  };

  if (typeof frontmatterData.v === "number") res.v = frontmatterData.v as 1;
  if (typeof frontmatterData.uuid === "string") res.uuid = frontmatterData.uuid;
  if (typeof frontmatterData.title === "string") res.title = frontmatterData.title;
  if (typeof frontmatterData.style === "number") res.style = frontmatterData.style;
  if (Array.isArray(frontmatterData.tags)) res.tags = frontmatterData.tags as ITag[];
  if (frontmatterData.modified) res.modified = new Date(frontmatterData.modified);
  if (typeof frontmatterData.width === "number") res.width = frontmatterData.width;
  if (typeof frontmatterData.height === "number") res.height = frontmatterData.height;
  if (typeof frontmatterData.open === "boolean") res.open = frontmatterData.open;

  return res;
}
