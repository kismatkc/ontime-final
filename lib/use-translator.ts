import axios from "axios";
import { useCallback, useState } from "react";
import { decode } from "html-entities";
import { Sound } from "expo-av/build/Audio";

export function useTranslator() {
  const [translation, setTranslation] = useState<null | string>(null);
  const [wordBreakdown, setWordBreakdown] = useState<null | string>(null);
  const [soundBase64, setSoundBase64] = useState<Sound | null>();
  const fetchTranslation = useCallback(
    async (text: string, sourceLanguage: string, targetLanguage: string) => {
      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`;
        const response = await axios.post(url, {
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
        });
        const translatedText: string = decode(
          response.data.data.translations[0].translatedText
        );

        if (!(translatedText.length > 0)) return;
        setTranslation(translatedText);
      } catch (error) {
        console.error("Error fetching translation:", error);
        return null;
      }
    },
    []
  );
  const fetchSound = useCallback(
    async (text: string, speakingRate: number, targetLanguage: string) => {
      try {
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.EXPO_PUBLIC_GOOGLE_API_KEY}`;
        const response = await axios.post(url, {
          input: {
            text,
          },
          voice: {
            languageCode: targetLanguage === "fr" ? "fr-FR" : "en-US",
            name:
              targetLanguage === "fr" ? "fr-FR-Standard-A" : "en-US-Wavenet-D",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate,
          },
        });

        const audioContent = response.data.audioContent;

        setSoundBase64(audioContent);
      } catch (error) {
        console.error("Error fetching translation:", error);
        return null;
      }
    },
    []
  );

  const fetchWordBreakDOwn = useCallback(async (word: string) => {
    try {
      const response = await axios.get(
        `https://puppeter-kismat-kcs-projects.vercel.app/get-word-breakdown/${word}`
      );
      const breakDown = response.data.data;
      const translatedText: string = decode(breakDown);

      setWordBreakdown(translatedText);
    } catch (error) {
      console.log(error);
    }
  }, []);

  return {
    translation,
    fetchTranslation,
    setTranslation,
    fetchSound,
    soundBase64,
    setSoundBase64,
    wordBreakdown,
    setWordBreakdown,
    fetchWordBreakDOwn,
  };
}
