let stok = JSON.parse(localStorage.getItem("stok")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Periksa apakah ada produk yang baru saja dibeli
const produkTerjual = localStorage.getItem("produkTerjual");
if (produkTerjual) {
  const index = stok.findIndex(p => p.nama === produkTerjual);
  if (index !== -1) {
    stok[index].terjual = true;
    localStorage.setItem("stok", JSON.stringify(stok));
  }
  localStorage.removeItem("produkTerjual"); // Hapus penanda agar tidak terus-menerus terjual
}

function renderProduk(filter = "all") {
  const list = document.getElementById("stokList");
  list.innerHTML = "";

  let filtered = stok;
  if (filter === "tersedia") filtered = stok.filter(p => !p.terjual);
  if (filter === "terjual") filtered = stok.filter(p => p.terjual);

  if (filtered.length === 0) {
    list.innerHTML = `<p class="text-gray-400">Belum ada produk...</p>`;
    return;
  }

  filtered.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "p-4 bg-gray-800 rounded-lg flex justify-between items-center shadow-md border border-gray-700";
    li.innerHTML = `
      <div class="flex items-center gap-4">
        ${p.foto && p.foto.length > 0 ? `<img src="${p.foto[0]}" alt="${p.nama}" class="w-20 h-20 rounded-lg object-cover border border-blue-400 cursor-pointer product-thumbnail">` : ''}
        <div>
          <p class="font-bold text-lg text-blue-300">${p.nama}</p>
          <p class="text-md text-green-400">Rp ${p.harga}</p>
          <p class="text-sm text-gray-300 mt-1">${p.deskripsi}</p>
          <p class="text-xs text-purple-300 mt-1">Roblox ID: ${p.usernameRoblox || 'N/A'}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button onclick="toggleTerjual(${i})" 
          class="px-3 py-1 rounded-full text-white ${p.terjual ? 'bg-red-600' : 'bg-green-600'} font-semibold animated-btn">
          ${p.terjual ? 'Terjual' : 'Tersedia'}
        </button>
        <button onclick="hapusProduk(${i})" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-full font-semibold animated-btn">❌ Hapus</button>
      </div>
    `;
    list.appendChild(li);

    // Tambahkan event listener ke gambar thumbnail di panel admin juga
    const thumbnail = li.querySelector('.product-thumbnail');
    if (thumbnail && p.foto && p.foto.length > 0) {
      thumbnail.addEventListener('click', () => {
        // Asumsi ada fungsi showImageModal() di admin.html jika ingin fungsionalitas serupa
        // Atau cukup tampilkan gambar pertama
        alert('Ini adalah gambar pertama. Fitur galeri penuh hanya di halaman toko.');
      });
    }
  });

  updateStats();
}

function renderTransactions() {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = `<p class="text-gray-400">Belum ada transaksi...</p>`;
    return;
  }

  transactions.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "p-3 bg-gray-700 rounded-lg";
    li.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <p class="font-semibold text-sm">Pembeli: ${t.nama}</p>
        <span class="text-xs text-gray-400">${t.tanggal}</span>
      </div>
      <p class="text-xs text-gray-300">Produk: ${t.produk}</p>
      <p class="text-xs text-gray-300">Email: ${t.email}</p>
      <p class="text-xs text-gray-300">Jumlah: Rp ${t.harga}</p>
      <p class="text-xs text-gray-300">Bank: ${t.bank}</p>
      <p class="text-xs text-gray-300">Keterangan: ${t.keterangan}</p>
      <button onclick="hapusTransaction(${i})" class="mt-2 px-2 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-xs">Hapus</button>
    `;
    list.appendChild(li);
  });
}

function tambahProduk() {
  const nama = document.getElementById("namaProduk").value.trim();
  const harga = document.getElementById("hargaProduk").value.trim();
  const deskripsi = document.getElementById("deskripsiProduk").value.trim();
  const usernameRoblox = document.getElementById("usernameRoblox").value.trim();
  const fotoInput = document.getElementById("fotoProduk");
  const files = fotoInput.files; // Ambil semua file yang dipilih

  if (!nama || !harga) {
    alert("Nama item dan harga wajib diisi!");
    return;
  }
  if (files.length === 0) {
      alert("Harap unggah minimal satu foto item!");
      return;
  }
  if (files.length > 20) {
      alert("Maksimal 20 foto yang dapat diunggah!");
      return;
  }

  const readerPromises = [];
  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      readerPromises.push(new Promise((resolve) => {
          reader.onload = function(e) {
              resolve(e.target.result);
          };
          reader.readAsDataURL(file);
      }));
  }

  Promise.all(readerPromises).then(fotoURLs => {
      stok.push({ 
          nama, 
          harga, 
          deskripsi, 
          usernameRoblox, 
          foto: fotoURLs, // Simpan array URL foto
          terjual: false 
      });
      localStorage.setItem("stok", JSON.stringify(stok));
      resetForm();
      renderProduk();
  }).catch(error => {
      console.error("Gagal membaca file: ", error);
      alert("Terjadi kesalahan saat mengunggah foto. Silakan coba lagi.");
  });
}

function resetForm() {
  document.getElementById("namaProduk").value = "";
  document.getElementById("hargaProduk").value = "";
  document.getElementById("deskripsiProduk").value = "";
  document.getElementById("usernameRoblox").value = "";
  document.getElementById("fotoProduk").value = null; // Reset input file
}

function hapusProduk(i) {
  if (confirm("Yakin ingin menghapus item ini dari galaksi?")) {
    stok.splice(i, 1);
    localStorage.setItem("stok", JSON.stringify(stok));
    renderProduk();
  }
}

function hapusTransaction(i) {
  if (confirm("Yakin ingin menghapus transaksi ini?")) {
    transactions.splice(i, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
  }
}

function toggleTerjual(i) {
  stok[i].terjual = !stok[i].terjual;
  localStorage.setItem("stok", JSON.stringify(stok));
  renderProduk();
}

function updateStats() {
  document.getElementById("total").innerText = stok.length;
  document.getElementById("tersedia").innerText = stok.filter(p => !p.terjual).length;
  document.getElementById("terjual").innerText = stok.filter(p => p.terjual).length;
}

function filterProduk(status) {
  renderProduk(status);
}

document.getElementById("search").addEventListener("input", function() {
  const keyword = this.value.toLowerCase();
  const filtered = stok.filter(p => p.nama.toLowerCase().includes(keyword) || p.deskripsi.toLowerCase().includes(keyword));
  const list = document.getElementById("stokList");
  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = `<p class="text-gray-400">Tidak ada hasil ditemukan di galaksi...</p>`;
    return;
  }

  filtered.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "p-4 bg-gray-800 rounded-lg flex justify-between items-center shadow-md border border-gray-700";
    li.innerHTML = `
      <div class="flex items-center gap-4">
        ${p.foto && p.foto.length > 0 ? `<img src="${p.foto[0]}" alt="${p.nama}" class="w-20 h-20 rounded-lg object-cover border border-blue-400 cursor-pointer product-thumbnail">` : ''}
        <div>
          <p class="font-bold text-lg text-blue-300">${p.nama}</p>
          <p class="text-md text-green-400">Rp ${p.harga}</p>
          <p class="text-sm text-gray-300 mt-1">${p.deskripsi}</p>
          <p class="text-xs text-purple-300 mt-1">Roblox ID: ${p.usernameRoblox || 'N/A'}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button onclick="toggleTerjual(${i})" 
          class="px-3 py-1 rounded-full text-white ${p.terjual ? 'bg-red-600' : 'bg-green-600'} font-semibold animated-btn">
          ${p.terjual ? 'Terjual' : 'Tersedia'}
        </button>
        <button onclick="hapusProduk(${i})" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-full font-semibold animated-btn">❌ Hapus</button>
      </div>
    `;
    list.appendChild(li);

    // Tambahkan event listener ke gambar thumbnail hasil pencarian
    const thumbnail = li.querySelector('.product-thumbnail');
    if (thumbnail && p.foto && p.foto.length > 0) {
      thumbnail.addEventListener('click', () => {
        // Asumsi ada fungsi showImageModal() di admin.html jika ingin fungsionalitas serupa
        // Atau cukup tampilkan gambar pertama
        alert('Ini adalah gambar pertama. Fitur galeri penuh hanya di halaman toko.');
      });
    }
  });
  updateStats();
});

renderProduk();