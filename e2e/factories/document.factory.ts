// ---------------------------------------------------------------------------
// Document factory
//
// Provides convenience access to document test data.
// ---------------------------------------------------------------------------
import { docDetails1 } from "../data/test-data";

export const documents = {
  doc1: docDetails1,
} as const;

export type DocumentData = {
  title: string;
};
