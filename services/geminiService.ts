
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

export const extractTransactions = async (files: File[]): Promise<Transaction[]> => {
    const imageParts = await Promise.all(
        files.map(async (file) => {
            const base64Data = await fileToBase64(file);
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            };
        })
    );

    const prompt = `You are an intelligent document processing agent specializing in financial statements. Your task is to analyze the provided bank statement image(s) and meticulously extract all transaction details. For each row in the transaction table, extract the date, particulars/description, payments (debits/withdrawals), receipts (credits/deposits), and the running balance. Ignore headers, footers, and summary sections like 'TOTAL DEPOSITS'. Return the data as a JSON array of objects, strictly adhering to the provided schema. If a payment or receipt column is empty for a transaction, use a value of null. Clean the data by removing currency symbols and commas from numbers. Ensure the final balance string includes 'Dr' or 'Cr' if present.`;

    // Create a new GoogleGenAI instance right before making an API call
    // This ensures it uses the most up-to-date API key from the BYOK dialog.
    const ai = new GoogleGenAI({ apiKey: proce
    s.env.API_KEY });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts: [ {text: prompt}, ...imageParts] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: "Transaction date (e.g., DD/MM/YY)" },
                        particulars: { type: Type.STRING, description: "Description or particulars of the transaction" },
                        payments: { type: Type.NUMBER, nullable: true, description: "Payment/Debit amount, null if not present" },
                        receipts: { type: Type.NUMBER, nullable: true, description: "Receipt/Credit amount, null if not present" },
                        balance: { type: Type.STRING, description: "Running balance after the transaction" },
                    },
                     required: ["date", "particulars", "balance"],
                },
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as Transaction[];
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("Could not parse the data from the bank statement. The document format might be unsupported.");
    }
};
