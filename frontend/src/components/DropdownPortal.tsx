import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DropdownPortal = ({ children, isOpen, onClose, className = '', style = {} }: DropdownPortalProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div ref={dropdownRef} className={className} style={style}>
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;
