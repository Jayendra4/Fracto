'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface TextTypeProps {
  introText: string;
  rotatingTexts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
}

export default function TextType({
  introText,
  rotatingTexts,
  typingSpeed = 60,
  deletingSpeed = 40,
  pauseDuration = 1200,
  showCursor = true,
}: TextTypeProps) {
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [introDone, setIntroDone] = useState(false);

  useLayoutEffect(() => {
    if (!cursorRef.current || !showCursor) return;

    const ctx = gsap.context(() => {
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    });

    return () => ctx.revert();
  }, [showCursor]);

  useLayoutEffect(() => {
    if (!line1Ref.current) return;

    const ctx = gsap.context(() => {
      const el = line1Ref.current!;
      const chars = introText.split('');
      el.innerHTML = '';

      const tl = gsap.timeline({
        onComplete: () => setIntroDone(true),
      });

      chars.forEach((char) => {
        tl.to(
          { step: 0 },
          {
            duration: typingSpeed / 1000,
            onComplete: () => {
              el.innerHTML += char;
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [introText, typingSpeed]);

  useLayoutEffect(() => {
    if (!introDone || !line2Ref.current) return;

    const ctx = gsap.context(() => {
      const el = line2Ref.current!;

      const typeText = (text: string) =>
        gsap.fromTo(
          { i: 0 },
          { i: 0 },
          {
            i: text.length,
            duration: (text.length * typingSpeed) / 1000,
            ease: 'none',
            onUpdate(this: gsap.core.Tween) {
              const obj = this.targets()[0] as { i: number };
              el.innerHTML = text.substring(0, Math.floor(obj.i));
            },
          }
        );

      const deleteText = (text: string) =>
        gsap.fromTo(
          { i: text.length },
          { i: text.length },
          {
            i: 0,
            duration: (text.length * deletingSpeed) / 1000,
            ease: 'none',
            onUpdate(this: gsap.core.Tween) {
              const obj = this.targets()[0] as { i: number };
              el.innerHTML = text.substring(0, Math.floor(obj.i));
            },
          }
        );

      const loopTL = gsap.timeline({ repeat: -1 });

      rotatingTexts.forEach((text) => {
        loopTL.add(typeText(text));
        loopTL.to({}, { duration: pauseDuration / 1000 });
        loopTL.add(deleteText(text));
      });
    });

    return () => ctx.revert();
  }, [introDone, rotatingTexts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div
      className={`flex flex-col font-Typetext font-thin text-dark-grey leading-[100%]`}
    >
      <span ref={line1Ref} className="  font-68 leading-[100%] "></span>
      <div className="flex items-start h-[60px] mt-4 font-light  ">
        <span className="font-68  leading-[100%] " ref={line2Ref}></span>

        {showCursor && (
          <span
            ref={cursorRef}
            className="ml-1 leading-[100%] inline-block font-68 "
          >
            |
          </span>
        )}
      </div>
    </div>
  );
}
