//% color=#5C9CAF icon="\uf2a1" block="Gesture Sensor"
namespace groveGesture {
    // 7-bit I2C address (PAG7661 on Grove Smart IR Gesture)
    const I2C_ADDR = 0x63

    // --- low-level helpers ---
    function wr(reg: number, val: number) {
        const b = pins.createBuffer(2)
        b[0] = reg & 0xFF
        b[1] = val & 0xFF
        pins.i2cWriteBuffer(I2C_ADDR, b, false)
    }
    function rdU8(reg: number): number {
        pins.i2cWriteNumber(I2C_ADDR, reg & 0xFF, NumberFormat.UInt8BE, false)
        return pins.i2cReadNumber(I2C_ADDR, NumberFormat.UInt8BE, false) & 0xFF
    }
    function rdI8(reg: number): number {
        let v = rdU8(reg)
        return (v & 0x80) ? v - 256 : v
    }

    /**
     * Initialize the Grove Smart IR Gesture sensor (PAG7661QN)
     * Sets bank=0, switches to Gesture mode, enables common gesture engines.
     * @returns true if PartID matches (0x7660)
     */
    //% block="initialize gesture sensor"
    //% weight=100 group="Setup"
    export function init(): boolean {
        // Select register bank 0
        wr(0x7F, 0x00)

        // Read PartID (lo @0x00, hi @0x01) -> expect 0x7660
        const id_lo = rdU8(0x00)
        const id_hi = rdU8(0x01)
        const partId = (id_hi << 8) | id_lo

        // Set Gesture operating mode
        // R_OP_Mode_Host @0x10: 0x04 = Gesture
        wr(0x10, 0x04)
        basic.pause(10)

        // Combined gesture mode (thumb + cursor etc.)
        // R_Gesture_Mode @0x22: 0x05 = Combined
        wr(0x22, 0x05)

        // Enable all basic gesture engines
        // R_Gesture_EnL @0x65: bits 0..6 = Pinch/Grab/Tap/Rotate/Swipe/Push/Static
        wr(0x65, 0x7F)

        return partId == 0x7660
    }

    // --- Simple outputs (you can add more similarly) ---

    /**
     * Is "Thumb Up" detected?
     */
    //% block="thumb up?"
    //% weight=90 group="Readouts"
    export function thumbUp(): boolean {
        // Thumb_Up flag @0x57 bit0
        return (rdU8(0x57) & 0x01) != 0
    }

    /**
     * Is "Thumb Down" detected?
     */
    //% block="thumb down?"
    //% weight=89 group="Readouts"
    export function thumbDown(): boolean {
        // Thumb_Down flag @0x5B bit0
        return (rdU8(0x5B) & 0x01) != 0
    }

    /**
     * Cursor X (11-bit)
     */
    //% block="cursor X"
    //% weight=80 group="Readouts
