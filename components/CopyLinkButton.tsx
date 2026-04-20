'use client';

import { Check, Link } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant='ghost' size='sm' onClick={handleCopy}>
      {copied ? (
        <>
          <Check className='size-4' />
          Copied!
        </>
      ) : (
        <>
          <Link className='size-4' />
          Copy link
        </>
      )}
    </Button>
  );
};

export default CopyLinkButton;
