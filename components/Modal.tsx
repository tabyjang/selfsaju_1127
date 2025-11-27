import React, { useEffect, useState, useRef } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = modalRef.current;
      setPosition({
        x: Math.max(0, (innerWidth - offsetWidth) / 2),
        y: Math.max(0, (innerHeight - offsetHeight) / 2),
      });
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (!modalRef.current) return;
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col"
      >
        <header 
          className="p-6 md:p-8 border-b border-gray-200 flex justify-between items-center cursor-move"
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500 select-none">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer"
            aria-label="Close modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 md:p-8 overflow-y-auto max-h-[65vh] custom-scrollbar">
          <div className="prose max-w-none prose-lg text-gray-600 prose-p:my-3 prose-p:leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};