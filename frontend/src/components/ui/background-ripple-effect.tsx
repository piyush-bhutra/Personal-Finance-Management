import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundCellsProps {
    children?: React.ReactNode;
    className?: string;
}

/**
 * BackgroundCells — wraps a section with the ripple grid (original usage).
 * For a full-page effect, use <PageRippleBackground /> instead.
 */
export const BackgroundCells = ({ children, className }: BackgroundCellsProps) => {
    return (
        <div className={cn("relative flex justify-center overflow-hidden", className)}>
            <BackgroundCellCore fullPage={false} />
            {children && (
                <div className="relative z-50 pointer-events-none select-none w-full">
                    {children}
                </div>
            )}
        </div>
    );
};

/**
 * PageRippleBackground — renders a fixed, full-viewport grid that follows
 * the mouse across the entire page. Drop this as a sibling inside your
 * page root and it will sit behind all content.
 */
export const PageRippleBackground = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "fixed inset-0 z-0 overflow-hidden pointer-events-none",
                className
            )}
        >
            <BackgroundCellCore fullPage={true} />
        </div>
    );
};

/* ────────────────────────────────────────────────────────── */

interface BackgroundCellCoreProps {
    fullPage: boolean;
}

const BackgroundCellCore = ({ fullPage }: BackgroundCellCoreProps) => {
    const [mousePosition, setMousePosition] = useState({ x: -9999, y: -9999 });
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!fullPage) return;
        // For full-page mode, track the raw viewport mouse coordinates
        const handleMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, [fullPage]);

    const handleMouseMove = (event: React.MouseEvent) => {
        if (fullPage) return; // handled by window listener above
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            setMousePosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
        }
    };

    const size = 320;

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            className="h-full absolute inset-0"
        >
            {/* Mouse-revealed highlighted grid */}
            <div
                className="absolute inset-0 z-20 bg-transparent"
                style={{
                    maskImage: `radial-gradient(${size / 4}px circle at center, white, transparent)`,
                    WebkitMaskImage: `radial-gradient(${size / 4}px circle at center, white, transparent)`,
                    WebkitMaskPosition: `${mousePosition.x - size / 2}px ${mousePosition.y - size / 2}px`,
                    WebkitMaskSize: `${size}px`,
                    maskSize: `${size}px`,
                    pointerEvents: "none",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                }}
            >
                <Pattern cellClassName="border-primary/50 relative z-[100]" />
            </div>
            {/* Base faint grid — always visible at low opacity */}
            <Pattern className="opacity-[0.35]" cellClassName="border-border/60" />
        </div>
    );
};

/* ────────────────────────────────────────────────────────── */

interface PatternProps {
    className?: string;
    cellClassName?: string;
}

interface CellProps {
    cellClassName?: string;
    rowIdx: number;
    colIdx: number;
    clickedCell: [number, number] | null;
    onCellClick: (pos: [number, number]) => void;
}

const Cell = ({ cellClassName, rowIdx, colIdx, clickedCell, onCellClick }: CellProps) => {
    const controls = useAnimation();

    useEffect(() => {
        if (clickedCell) {
            const distance = Math.sqrt(
                Math.pow(clickedCell[0] - rowIdx, 2) + Math.pow(clickedCell[1] - colIdx, 2)
            );
            controls.start({
                opacity: [0, Math.max(0, 1 - distance * 0.1), 0],
                transition: { duration: Math.max(0.1, distance * 0.15) },
            });
        }
    }, [clickedCell, rowIdx, colIdx, controls]);

    return (
        <div
            className={cn(
                "bg-transparent border-l border-b h-12 w-12",
                cellClassName
            )}
            onClick={() => onCellClick([rowIdx, colIdx])}
            style={{ pointerEvents: "auto" }}
        >
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: [0, 1, 0.5] }}
                transition={{ duration: 0.5, ease: "backOut" }}
                animate={controls}
                className="bg-[rgba(14,165,233,0.25)] h-full w-full"
            />
        </div>
    );
};

const Pattern = ({ className, cellClassName }: PatternProps) => {
    // Make grid large enough to cover big screens even when scrolled
    const COLS = 60;
    const ROWS = 40;
    const [clickedCell, setClickedCell] = useState<[number, number] | null>(null);

    return (
        <div className={cn("flex flex-row relative z-30", className)}>
            {Array.from({ length: COLS }).map((_, colIdx) => (
                <div key={`col-${colIdx}`} className="flex flex-col relative z-20">
                    {Array.from({ length: ROWS }).map((_, rowIdx) => (
                        <Cell
                            key={`cell-${colIdx}-${rowIdx}`}
                            cellClassName={cellClassName}
                            rowIdx={colIdx}
                            colIdx={rowIdx}
                            clickedCell={clickedCell}
                            onCellClick={setClickedCell}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};
