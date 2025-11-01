
/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result is in format "data:image/jpeg;base64,..."
      // We only need the part after the comma.
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};
