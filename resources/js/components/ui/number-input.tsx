import * as React from 'react';
import { Input } from './input';

function formatNum(s: string): string {
    const raw = s.replace(/\D/g, '');
    if (!raw) return '';
    return Number(raw).toLocaleString('id-ID');
}

function parseNum(s: string): string {
    return s.replace(/\./g, '');
}

type Props = Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> & {
    value?: string | number;
    onValueChange?: (raw: string) => void;
};

export function NumberInput({ value, onValueChange, ...props }: Props) {
    const [display, setDisplay] = React.useState(
        formatNum(String(value ?? '')),
    );

    React.useEffect(() => {
        setDisplay(formatNum(String(value ?? '')));
    }, [value]);

    return (
        <Input
            type="text"
            inputMode="numeric"
            {...props}
            value={display}
            onChange={(e) => {
                const formatted = formatNum(e.target.value);
                setDisplay(formatted);
                onValueChange?.(parseNum(formatted));
            }}
        />
    );
}
