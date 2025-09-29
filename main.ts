//% color=#5C9CAF icon="\uf2a1" block="Gesture Sensor"
namespace groveGesture {
    const I2C_ADDR = 0x63

    // ===== KONFIGURACJA – UZUPEŁNIJ ADRESY/MASKI Z DATASHEET PAG7661QN =====
    // Wpisz rejestry i bity dla gestów dynamicznych i statycznych
    // (sekcje: Gesture Output Register / Hand Information Register)
    const REGMAP = {
        bankSel: 0x7F,
        partIdLo: 0x00,
        partIdHi: 0x01,
        opMode: 0x10,
        gestureMode: 0x22,
        gestureEnL: 0x65,
        // gotowe: kciuki / kursor / kąt
        thumbUpReg: 0x57,   thumbUpMask: 0x01,
        thumbDnReg: 0x5B,   thumbDnMask: 0x01,
        cursorXLo: 0x59, cursorYLo: 0x5A, cursorXYHi: 0x61, // 11-bit
        angAccLo: 0x5C, angAccHi: 0x5D, // signed
        // DO UZUPEŁNIENIA (przykładowe wartości = 0x00, maski = 0):
        swipeReg: 0x00,      swipeLeftMask: 0x00,  swipeRightMask: 0x00,
        tapReg: 0x00,        tapMask: 0x00,
        grabReg: 0x00,       grabMask: 0x00,
        pinchReg: 0x00,      pinchMask: 0x00,
        pushReg: 0x00,       pushMask: 0x00,       // N-finger push – jeśli jest kilka masek, obsłuż w kodzie
        staticReg: 0x00,     static1Mask: 0x00, static2Mask: 0x00, static3Mask: 0x00, static4Mask: 0x00, static5Mask: 0x00,
        rotateReg: 0x00,     rotateCwMask: 0x00,  rotateCcwMask: 0x00
    }
    // ===== KONIEC MIEJSCA NA UZUPEŁNIENIE =====

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
    function testFlag(reg: number, mask: number): boolean {
        if (reg == 0 || mask == 0) return false
        return (rdU8(reg) & mask) != 0
    }

    /**
     * Initialize the Grove Smart IR Gesture sensor (PAG7661QN)
     * Sets bank=0, switches to Gesture mode, enables common gesture engines.
     * @returns true if PartID matches (0x7660)
     */
    //% block="initialize gesture sensor"
    //% weight=100 group="Setup"
    export function init(): boolean {
        wr(REGMAP.bankSel, 0x00)
        const id_lo = rdU8(REGMAP.partIdLo)
        const id_hi = rdU8(REGMAP.partIdHi)
        const partId = (id_hi << 8) | id_lo

        // 0x04 = Gesture mode
        wr(REGMAP.opMode, 0x04)
        basic.pause(10)
        // 0x05 = Combined gesture mode (kciuki + kursor itp.)
        wr(REGMAP.gestureMode, 0x05)
        // enable engines: Pinch/Grab/Tap/Rotate/Swipe/Push/Static (bity 0..6)
        wr(REGMAP.gestureEnL, 0x7F)
        return partId == 0x7660
    }

    // ====== PODSTAWOWE ODCZYTY (działające) ======
    //% block="thumb up?"
    //% weight=90 group="Readouts"
    export function thumbUp(): boolean {
        return testFlag(REGMAP.thumbUpReg, REGMAP.thumbUpMask)
    }
    //% block="thumb down?"
    //% weight=89 group="Readouts"
    export function thumbDown(): boolean {
        return testFlag(REGMAP.thumbDnReg, REGMAP.thumbDnMask)
    }
    //% block="cursor X"
    //% weight=80 group="Readouts"
    export function cursorX(): number {
        const xLo = rdU8(REGMAP.cursorXLo)
        const hi  = rdU8(REGMAP.cursorXYHi)
        const xHi = hi & 0x07
        return (xHi << 8) | xLo
    }
    //% block="cursor Y"
    //% weight=79 group="Readouts"
    export function cursorY(): number {
        const yLo = rdU8(REGMAP.cursorYLo)
        const hi  = rdU8(REGMAP.cursorXYHi)
        const yHi = (hi >> 3) & 0x07
        return (yHi << 8) | yLo
    }
    //% block="rotation angle (acc)"
    //% weight=78 group="Readouts"
    export function angleAccum(): number {
        const lsb = rdU8(REGMAP.angAccLo)
        const msb = rdI8(REGMAP.angAccHi)
        return (msb << 8) | lsb
    }

    // ====== DODATKOWE GESTY – BLOKI (adresy do uzupełnienia) ======
    //% block="swipe left?"
    //% weight=76 group="Readouts"
    export function isSwipeLeft(): boolean {
        return testFlag(REGMAP.swipeReg, REGMAP.swipeLeftMask)
    }
    //% block="swipe right?"
    //% weight=75 group="Readouts"
    export function isSwipeRight(): boolean {
        return testFlag(REGMAP.swipeReg, REGMAP.swipeRightMask)
    }
    //% block="tap?"
    //% weight=74 group="Readouts"
    export function isTap(): boolean {
        return testFlag(REGMAP.tapReg, REGMAP.tapMask)
    }
    //% block="grab?"
    //% weight=73 group="Readouts"
    export function isGrab(): boolean {
        return testFlag(REGMAP.grabReg, REGMAP.grabMask)
    }
    //% block="pinch?"
    //% weight=72 group="Readouts"
    export function isPinch(): boolean {
        return testFlag(REGMAP.pinchReg, REGMAP.pinchMask)
    }
    //% block="push?"
    //% weight=71 group="Readouts"
    export function isPush(): boolean {
        return testFlag(REGMAP.pushReg, REGMAP.pushMask)
    }
    //% block="rotate CW?"
    //% weight=70 group="Readouts"
    export function isRotateCW(): boolean {
        return testFlag(REGMAP.rotateReg, REGMAP.rotateCwMask)
    }
    //% block="rotate CCW?"
    //% weight=69 group="Readouts"
    export function isRotateCCW(): boolean {
        return testFlag(REGMAP.rotateReg, REGMAP.rotateCcwMask)
    }
    //% block="static fingers count"
    //% weight=68 group="Readouts"
    export function staticFingers(): number {
        // najprostsza wersja: sprawdzamy maski 1..5 (priorytet od 5 do 1)
        if (testFlag(REGMAP.staticReg, REGMAP.static5Mask)) return 5
        if (testFlag(REGMAP.staticReg, REGMAP.static4Mask)) return 4
        if (testFlag(REGMAP.staticReg, REGMAP.static3Mask)) return 3
        if (testFlag(REGMAP.staticReg, REGMAP.static2Mask)) return 2
        if (testFlag(REGMAP.staticReg, REGMAP.static1Mask)) return 1
        return 0
    }

    // ====== ZDARZENIA „ON GESTURE …” ======
    // ID grupy zdarzeń (dowolny, byle stały)
    const EVT_ID = 0x7661
    let _pollMs = 80
    let _debounceMs = 180
    let _evLoopStarted = false

    // enum do bloków
    export enum GestureType {
        //% block="thumb up"
        ThumbUp = 1,
        //% block="thumb down"
        ThumbDown,
        //% block="swipe left"
        SwipeLeft,
        //% block="swipe right"
        SwipeRight,
        //% block="tap"
        Tap,
        //% block="grab"
        Grab,
        //% block="pinch"
        Pinch,
        //% block="push"
        Push,
        //% block="rotate CW"
        RotateCW,
        //% block="rotate CCW"
        RotateCCW,
        //% block="static 1"
        Static1,
        //% block="static 2"
        Static2,
        //% block="static 3"
        Static3,
        //% block="static 4"
        Static4,
        //% block="static 5"
        Static5
    }

    // publiczne ustawienia pętli
    //% block="set polling interval %ms ms"
    //% ms.min=20 ms.max=500 ms.defl=80
    //% weight=40 group="Events"
    export function setPollingInterval(ms: number) { _pollMs = Math.max(20, Math.min(500, ms|0)) }
    //% block="set debounce %ms ms"
    //% ms.min=0 ms.max=1000 ms.defl=180
    //% weight=39 group="Events"
    export function setDebounce(ms: number) { _debounceMs = Math.max(0, Math.min(1000, ms|0)) }

    // rejestracja handlera
    //% block="on gesture %g"
    //% weight=50 group="Events"
    export function onGesture(g: GestureType, handler: () => void) {
        control.onEvent(EVT_ID, g, handler)
        if (!_evLoopStarted) {
            _evLoopStarted = true
            startEventLoop()
        }
    }

    // wewnętrzna pętla – wykrywanie zboczy + debounce
    let lastFire: { [k: number]: number } = {}
    function raiseOnce(gesture: GestureType) {
        const now = control.millis()
        const t = lastFire[gesture] || 0
        if (now - t >= _debounceMs) {
            lastFire[gesture] = now
            control.raiseEvent(EVT_ID, gesture)
        }
    }

    function startEventLoop() {
        control.inBackground(function () {
            while (true) {
                // ——— KCIUKI
                if (thumbUp()) raiseOnce(GestureType.ThumbUp)
                if (thumbDown()) raiseOnce(GestureType.ThumbDown)

                // ——— SWIPE
                if (isSwipeLeft())  raiseOnce(GestureType.SwipeLeft)
                if (isSwipeRight()) raiseOnce(GestureType.SwipeRight)

                // ——— TAP/GRAB/PINCH/PUSH
                if (isTap())   raiseOnce(GestureType.Tap)
                if (isGrab())  raiseOnce(GestureType.Grab)
                if (isPinch()) raiseOnce(GestureType.Pinch)
                if (isPush())  raiseOnce(GestureType.Push)

                // ——— ROTATE (z flag lub z kąta – tu flagi)
                if (isRotateCW())  raiseOnce(GestureType.RotateCW)
                if (isRotateCCW()) raiseOnce(GestureType.RotateCCW)

                // ——— STATIC FINGERS
                const sf = staticFingers()
                if (sf == 1) raiseOnce(GestureType.Static1)
                else if (sf == 2) raiseOnce(GestureType.Static2)
                else if (sf == 3) raiseOnce(GestureType.Static3)
                else if (sf == 4) raiseOnce(GestureType.Static4)
                else if (sf == 5) raiseOnce(GestureType.Static5)

                basic.pause(_pollMs)
            }
        })
    }

    // — Demo (zostawiam jak było)
    //% block="demo show icons (polling)"
    //% weight=10 group="Demo"
    export function demoShowIcons() {
        control.inBackground(function () {
            while (true) {
                if (thumbUp()) basic.showIcon(IconNames.Happy)
                else if (thumbDown()) basic.showIcon(IconNames.Sad)
                else basic.clearScreen()
                basic.pause(120)
            }
        })
    }
}
