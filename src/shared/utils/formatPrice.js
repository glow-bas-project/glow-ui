export function formatPrice(amountInMinorUnits) {
    if (amountInMinorUnits == null || Number.isNaN(amountInMinorUnits)) {
        return '';
    }

    const amount = amountInMinorUnits / 100;

    return `${amount.toLocaleString('da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} kr`;
}