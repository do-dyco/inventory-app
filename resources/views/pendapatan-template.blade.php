<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Template Hitungan Penjualan</title>
    <style>
        @page { size: A4 portrait; margin: 10mm; }
        * { box-sizing: border-box; }
        body { font: 11px Arial, sans-serif; color: #111; margin: 0; }
        .toolbar { padding: 16px; background: #eee; margin-bottom: 12px; }
        button { padding: 10px 16px; cursor: pointer; }
        .page { width: 190mm; margin: 0 auto; page-break-after: always; }
        .page:last-child { page-break-after: auto; }
        h1 { font-size: 17px; margin: 0 0 8px; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }
        .item { break-inside: avoid; margin-bottom: 4mm; }
        .name { font-weight: bold; min-height: 5mm; }
        .category { font-weight: normal; }
        .footer { font-size: 9px; text-align: right; margin-top: 4mm; }
        @media print { .toolbar { display: none; } .page { margin: 0; } }
    </style>
</head>
<body>
    <div class="toolbar">
        <button onclick="window.print()">Cetak / Simpan sebagai PDF</button>
        <span>Pilih A4, skala 100%, nonaktifkan header/footer browser.</span>
    </div>
    @forelse($menuItems->chunk(24) as $page)
        <section class="page">
            <h1>Hitungan Penjualan Harian</h1>
            <div class="meta"><span>Nama / Cabang: ________________________</span><span>Tanggal: __________________</span></div>
            <div class="columns">
                @foreach($page->values()->split(2) as $column)
                    <div>
                        @foreach($column as $menu)
                            <div class="item">
                                <div class="name">{{ $menu->name }} @if(trim($menu->category ?? '') !== '')<span class="category">({{ $menu->category }})</span>@endif</div>
                            </div>
                        @endforeach
                    </div>
                @endforeach
            </div>
            <div class="footer">Halaman {{ $loop->iteration }} / {{ (int) ceil($menuItems->count() / 24) }}</div>
        </section>
    @empty
        <p>Belum ada menu aktif. Tambahkan menu terlebih dahulu.</p>
    @endforelse
</body>
</html>
