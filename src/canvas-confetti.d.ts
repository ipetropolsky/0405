declare module 'canvas-confetti' {
    export interface ConfettiOptions {
        angle?: number;
        disableForReducedMotion?: boolean;
        drift?: number;
        gravity?: number;
        origin?: {
            x?: number;
            y?: number;
        };
        particleCount?: number;
        scalar?: number;
        spread?: number;
        startVelocity?: number;
        ticks?: number;
        zIndex?: number;
    }

    export default function confetti(options?: ConfettiOptions): Promise<null> | null;
}
