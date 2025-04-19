'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
    labelPosition?: 'top' | 'bottom';
    label?: (value: number | undefined) => React.ReactNode;
    showTooltip?: boolean;
}

const DualRangeSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    DualRangeSliderProps
>(({ className, label, labelPosition = 'top', showTooltip = true, ...props }, ref) => {
    const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const [activeThumbIndex, setActiveThumbIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        const handleMouseUp = () => {
            setIsDragging(false);
            setActiveThumbIndex(null);
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, []);

    const onThumbMouseDown = (index: number) => {
        setIsDragging(true);
        setActiveThumbIndex(index);
    };

    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn('relative flex w-full touch-none select-none items-center', className)}
            onValueChange={(value) => {
                if (props.onValueChange) {
                    props.onValueChange(value);
                }
            }}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
                <SliderPrimitive.Range className="absolute h-full bg-primary" />
            </SliderPrimitive.Track>
            {initialValue.map((value, index) => (
                <React.Fragment key={index}>
                    <SliderPrimitive.Thumb 
                        className="relative block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onMouseDown={() => onThumbMouseDown(index)}
                        onTouchStart={() => onThumbMouseDown(index)}
                    >
                        {label && (
                            <span
                                className={cn(
                                    'absolute flex w-full justify-center',
                                    labelPosition === 'top' && '-top-7',
                                    labelPosition === 'bottom' && 'top-4',
                                )}
                            >
                                {label(value)}
                            </span>
                        )}
                        {showTooltip && (hoveredIndex === index || activeThumbIndex === index) && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                                <div className="bg-primary text-primary-foreground text-xs rounded px-2 py-1 whitespace-nowrap">
                                    {value}
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
                            </div>
                        )}
                    </SliderPrimitive.Thumb>
                </React.Fragment>
            ))}
        </SliderPrimitive.Root>
    );
});
DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };
