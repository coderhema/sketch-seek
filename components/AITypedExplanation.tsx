import React, { useState, useEffect } from 'react';
import { generateExplanation } from '../services/geminiService';

interface AITypedExplanationProps {
  sectionName: string;
}

const explanationCache = new Map<string, string>();

const AITypedExplanation: React.FC<AITypedExplanationProps> = ({ sectionName }) => {
  const [explanation, setExplanation] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getExplanation = async () => {
      if (explanationCache.has(sectionName)) {
        setExplanation(explanationCache.get(sectionName)!);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const text = await generateExplanation(sectionName);
        explanationCache.set(sectionName, text);
        setExplanation(text);
      } catch (error) {
        console.error(error);
        setExplanation(`Discover more about the ${sectionName}.`);
      } finally {
        setIsLoading(false);
      }
    };

    getExplanation();
  }, [sectionName]);

  useEffect(() => {
    if (explanation) {
      setDisplayedText(''); // Reset for new explanations
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < explanation.length) {
          setDisplayedText(prev => prev + explanation.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 30); // Adjust typing speed here

      return () => clearInterval(typingInterval);
    }
  }, [explanation]);

  if (isLoading) {
    return <div className="text-sm text-neutral-500 h-5 bg-neutral-200 rounded-full w-3/4 animate-pulse"></div>;
  }

  return (
    <p className="text-sm text-neutral-600 font-medium h-6 m-3">
      {displayedText}
      <span className="animate-ping">|</span>
    </p>
  );
};

export default AITypedExplanation;