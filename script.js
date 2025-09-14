let produk = JSON.parse(localStorage.getItem("produk")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Periksa apakah ada produk yang baru saja dibeli
const produkDibeli = localStorage.getItem("produkDibeli");
if (produkDibeli) {
  const index = produk.findIndex(p => p.nama === produkDibeli);
  if (index !== -1 && produk[index].stok > 0) {
    produk[index].stok -= 1;
    localStorage.setItem("produk", JSON.stringify(produk));
  }
  localStorage.removeItem("produkDibeli"); // Hapus penanda agar tidak terus-menerus terjual
}

function renderProduk(filter = "all") {
  const list = document.getElementById("stokList");
  list.innerHTML = "";

  let filtered = produk;
  if (filter === "tersedia") filtered = produk.filter(p => p.stok > 0);
  if (filter === "terjual") filtered = produk.filter(p => p.stok === 0);

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
          <p class="text-xs text-yellow-300 mt-1">Stok: ${p.stok}/${p.stokAwal}</p>
        </div>
      </div>
      <div class="flex gap-2">
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
  const stokProduk = parseInt(document.getElementById("stokProduk").value);
  const fotoInput = document.getElementById("fotoProduk");
  const files = fotoInput.files; // Ambil semua file yang dipilih

  if (!nama || !harga || isNaN(stokProduk) || stokProduk <= 0) {
    alert("Nama, harga, dan jumlah stok wajib diisi. Stok harus lebih dari 0!");
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
      produk.push({
        nama,
        harga,
        deskripsi,
        usernameRoblox,
        stok: stokProduk,
        stokAwal: stokProduk, // Menyimpan stok awal untuk referensi
        foto: fotoURLs,
      });
      localStorage.setItem("produk", JSON.stringify(produk));
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
  document.getElementById("stokProduk").value = "";
  document.getElementById("fotoProduk").value = null; // Reset input file
}

function hapusProduk(i) {
  if (confirm("Yakin ingin menghapus item ini dari galaksi?")) {
    produk.splice(i, 1);
    localStorage.setItem("produk", JSON.stringify(produk));
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

function updateStats() {
  document.getElementById("total").innerText = produk.length;
  document.getElementById("tersedia").innerText = produk.filter(p => p.stok > 0).length;
  document.getElementById("terjual").innerText = produk.filter(p => p.stok === 0).length;
}

function filterProduk(status) {
  renderProduk(status);
}

document.getElementById("search").addEventListener("input", function() {
  const keyword = this.value.toLowerCase();
  const filtered = produk.filter(p => p.nama.toLowerCase().includes(keyword) || p.deskripsi.toLowerCase().includes(keyword));
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
          <p class="text-xs text-yellow-300 mt-1">Stok: ${p.stok}/${p.stokAwal}</p>
        </div>
      </div>
      <div class="flex gap-2">
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