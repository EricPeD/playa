
import { useState, useEffect, useRef } from 'react';
import { COUNTRY_CODES } from '@/lib/country';

export function PhoneModal({
  onSave,
  onClose,
  initialPhone,
  initialCountry,
}: {
  onSave: (phone: string, country: typeof COUNTRY_CODES[0]) => void;
  onClose: () => void;
  initialPhone: string;
  initialCountry: typeof COUNTRY_CODES[0];
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [country, setCountry] = useState(initialCountry);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const isValid = /^\d{7,12}$/.test(phone.replace(/\s/g, ''));

  // Bloquear scroll body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Al abrir picker → foco en buscador
  useEffect(() => {
    if (pickerOpen) {
      setTimeout(() => searchRef.current?.focus(), 80);
    } else {
      setSearch('');
    }
  }, [pickerOpen]);

  // Escape cierra picker primero, luego modal
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pickerOpen) { setPickerOpen(false); }
        else { onClose(); }
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [pickerOpen, onClose]);

  const filtered = COUNTRY_CODES.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.label.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.flag.includes(q)
    );
  });

  const handleSave = () => {
    if (!isValid) return;
    console.log('[PhoneModal] Guardando teléfono:', country.code, phone.trim());
    onSave(phone.trim(), country);
  };

  // ── Country Picker (fullscreen) ──────────────────────────────────────────
  if (pickerOpen) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col bg-[#FAFAF8]">
        {/* Header picker */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 bg-white border-b border-[#F0EDE8]">
          <button
            onClick={() => setPickerOpen(false)}
            className="w-9 h-9 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[#1A1A1A] active:scale-95 transition-transform shrink-0"
            aria-label="Volver"
          >
            {/* chevron left */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[#9B9589] uppercase tracking-widest">Seleccionar</p>
            <h2 className="text-[17px] font-bold text-[#1A1A1A]">Código de país</h2>
          </div>
        </div>

        {/* Buscador */}
        <div className="px-4 py-3 bg-white border-b border-[#F0EDE8]">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9589]">
              {/* search icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              ref={searchRef}
              type="text"
              inputMode="search"
              placeholder="Buscar país o código…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F5F2ED] text-[14px] text-[#1A1A1A] placeholder:text-[#B0ABA4] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9589] p-0.5"
              >
                {/* x circle */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-[14px] text-[#9B9589]">Sin resultados para «{search}»</p>
            </div>
          ) : (
            <ul>
              {filtered.map((c) => {
                const isSelected = c.code === country.code && c.label === country.label;
                return (
                  <li key={`${c.code}-${c.label}`}>
                    <button
                      onClick={() => {
                        console.log('[PhoneModal] País seleccionado:', c.label, c.code);
                        setCountry(c);
                        setPickerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left border-b border-[#F5F2ED] last:border-0 active:bg-[#F0EDE8] transition-colors ${
                        isSelected ? 'bg-[#F5F2ED]' : 'bg-white'
                      }`}
                    >
                      {/* Flag */}
                      <span className="text-[22px] w-8 text-center shrink-0">{c.flag}</span>

                      {/* Label */}
                      <span className={`flex-1 text-[15px] leading-snug ${isSelected ? 'font-semibold text-[#1A1A1A]' : 'text-[#2A2A2A]'}`}>
                        {c.label}
                      </span>

                      {/* Code */}
                      <span className="text-[14px] text-[#9B9589] tabular-nums shrink-0">{c.code}</span>

                      {/* Check si seleccionado */}
                      {isSelected && (
                        <span className="text-[#1A1A1A] shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // ── Phone input sheet (bottom sheet) ────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D0CCC5]" />
        </div>

        <div className="px-5 pt-3 pb-6 flex flex-col gap-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[19px] font-bold text-[#1A1A1A]">Tu teléfono</h3>
              <p className="text-[13px] text-[#9B9589] mt-0.5 leading-snug">
                El repartidor te contacta si no te localiza en la playa.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5F2ED] flex items-center justify-center text-[#9B9589] shrink-0 mt-0.5 active:scale-95 transition-transform"
              aria-label="Cerrar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Input combinado */}
          <div className="flex items-stretch gap-2">
            {/* Botón selector de país */}
            <button
              onClick={() => {
                console.log('[PhoneModal] Abriendo selector de país');
                setPickerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-3.5 rounded-2xl border border-[#E0DDD8] bg-[#FAFAF8] shrink-0 active:scale-95 transition-transform"
            >
              <span className="text-[20px] leading-none">{country.flag}</span>
              <span className="text-[14px] font-semibold text-[#1A1A1A] tabular-nums">{country.code}</span>
              {/* chevron down */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9B9589" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {/* Número */}
            <div className="relative flex-1">
              <input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9\s]*"
                placeholder="612 345 678"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d\s]/g, '');
                  console.log('[PhoneModal] Input teléfono cambiado:', val);
                  setPhone(val);
                }}
                className="w-full h-full rounded-2xl border border-[#E0DDD8] bg-[#FAFAF8] px-4 py-3.5 text-[17px] text-[#1A1A1A] placeholder:text-[#C0BDB8] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide"
                autoFocus
              />
              {/* Clear button si hay texto */}
              {phone.length > 0 && (
                <button
                  onClick={() => { setPhone(''); phoneRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#E0DDD8] flex items-center justify-center text-[#9B9589] active:scale-95"
                  aria-label="Borrar"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Preview número completo */}
          {phone.replace(/\s/g, '').length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F2ED]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9589" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6.56 6.56l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="text-[13px] text-[#9B9589]">
                {country.code} {phone.trim()}
              </span>
              {isValid && (
                <span className="ml-auto text-[#16A34A]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </span>
              )}
            </div>
          )}

          {/* Hint de validación */}
          {phone.replace(/\s/g, '').length > 0 && !isValid && (
            <p className="text-[12px] text-[#E65100] -mt-2 px-1">
              Introduce entre 7 y 12 dígitos.
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 text-[15px] font-semibold disabled:opacity-30 active:scale-[0.98] transition-transform"
          >
            {isValid ? `Guardar · ${country.code} ${phone.trim()}` : 'Introduce tu teléfono'}
          </button>
        </div>
      </div>
    </div>
  );
}