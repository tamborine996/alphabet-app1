import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Bookmark, BookmarkCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const AlphabetSpeechApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  
  const alphabet = Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    return isUpperCase ? letter : letter.toLowerCase();
  });

  const filteredIndices = showOnlyBookmarks 
    ? alphabet.map((_, index) => index).filter(index => bookmarks.has(index))
    : alphabet.map((_, index) => index);

  const currentFilteredIndex = filteredIndices.indexOf(currentIndex);

  const speakLetter = (letter) => {
    const utterance = new SpeechSynthesisUtterance(letter);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handlePrevious = () => {
    if (currentFilteredIndex > 0) {
      const newIndex = filteredIndices[currentFilteredIndex - 1];
      setCurrentIndex(newIndex);
      speakLetter(alphabet[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentFilteredIndex < filteredIndices.length - 1) {
      const newIndex = filteredIndices[currentFilteredIndex + 1];
      setCurrentIndex(newIndex);
      speakLetter(alphabet[newIndex]);
    }
  };

  const handleRandom = () => {
    const availableIndices = showOnlyBookmarks ? Array.from(bookmarks) : Array.from(Array(26).keys());
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setCurrentIndex(randomIndex);
      speakLetter(alphabet[randomIndex]);
    }
  };

  const toggleBookmark = () => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(currentIndex)) {
        newBookmarks.delete(currentIndex);
      } else {
        newBookmarks.add(currentIndex);
      }
      return newBookmarks;
    });
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const diff = startX - touch.clientX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleNext();
        } else {
          handlePrevious();
        }
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', handleTouchMove);
    }, { once: true });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Speaking Alphabet</h1>
      <Card>
        <CardContent>
          <div className="flex flex-col items-center p-4">
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <Label htmlFor="case-switch" className="text-lg font-medium">
                  {isUpperCase ? 'UPPERCASE' : 'lowercase'}
                </Label>
                <Switch
                  id="case-switch"
                  checked={isUpperCase}
                  onCheckedChange={setIsUpperCase}
                />
              </div>
              <div className="flex items-center space-x-4">
                <Label htmlFor="bookmark-switch" className="text-lg font-medium">
                  Bookmarks Only
                </Label>
                <Switch
                  id="bookmark-switch"
                  checked={showOnlyBookmarks}
                  onCheckedChange={setShowOnlyBookmarks}
                  disabled={bookmarks.size === 0}
                />
              </div>
            </div>

            <div 
              className="w-full flex items-center justify-between gap-4 p-4"
              onTouchStart={handleTouchStart}
            >
              <button
                onClick={handlePrevious}
                disabled={currentFilteredIndex === 0}
                className={`p-4 rounded-full ${currentFilteredIndex === 0 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-50'}`}
              >
                <ChevronLeft size={40} />
              </button>

              <div className="flex-1 flex flex-col items-center gap-2">
                <div 
                  onClick={() => speakLetter(alphabet[currentIndex])}
                  className="text-9xl font-bold text-blue-500 cursor-pointer hover:scale-110 transition-transform"
                >
                  {alphabet[currentIndex]}
                </div>
                <button
                  onClick={toggleBookmark}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {bookmarks.has(currentIndex) ? 
                    <BookmarkCheck className="w-8 h-8" /> : 
                    <Bookmark className="w-8 h-8" />
                  }
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={currentFilteredIndex === filteredIndices.length - 1}
                className={`p-4 rounded-full ${currentFilteredIndex === filteredIndices.length - 1 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-50'}`}
              >
                <ChevronRight size={40} />
              </button>
            </div>

            <Button
              onClick={handleRandom}
              className="mt-4 flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Random Letter
            </Button>

            <div className="w-full mt-8 flex justify-center gap-2 overflow-x-auto py-2">
              {alphabet.map((letter, index) => {
                if (showOnlyBookmarks && !bookmarks.has(index)) return null;
                return (
                  <div
                    key={letter}
                    className={`relative ${
                      index === currentIndex 
                        ? 'w-4' 
                        : 'w-2'
                    }`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex 
                          ? 'bg-blue-500' 
                          : 'bg-gray-300'
                      }`}
                    />
                    {bookmarks.has(index) && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Bookmark className="w-3 h-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
