const API = "/api/profiles";
const form = document.getElementById("profile-form");
const list = document.getElementById("profile-list");
const msg = document.getElementById("profile-msg");
const fields = ["name", "surname", "email", "phone", "skills"];

function readForm() {
  const d = {};
  fields.forEach((f) => (d[f] = document.getElementById(f).value.trim()));
  d.skills = d.skills.split(",").map((s) => s.trim()).filter(Boolean);
  return d;
}

function validate(d) {
  const e = {};
  if (d.name.length < 2) e.name = "Name must have at least 2 characters";
  if (d.surname.length < 2) e.surname = "Surname must have at least 2 characters";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) e.email = "Invalid email";
  if (!/^\+?[0-9\s\-]{7,15}$/.test(d.phone)) e.phone = "Invalid phone number";
  if (d.skills.length === 0) e.skills = "Add at least one skill";
  return e;
}

function showErrors(errors) {
  document.querySelectorAll(".error[data-for]").forEach((el) => {
    el.textContent = errors[el.dataset.for] || "";
  });
}

function setMsg(text, ok) {
  msg.textContent = text;
  msg.className = ok ? "ok" : "error";
}

async function loadProfiles() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("HTTP " + res.status);
    render(await res.json());
  } catch (err) {
    setMsg("Could not load profiles: " + err.message, false);
  }
}

function render(profiles) {
  list.innerHTML = "";
  if (profiles.length === 0) {
    list.textContent = "No profiles yet.";
    return;
  }
  profiles.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} ${p.surname} | ${p.email} | ${p.phone} | ${p.skills.join(", ")} `;
    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.onclick = () => startEdit(p);
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = () => removeProfile(p.id);
    li.append(edit, del);
    list.appendChild(li);
  });
}

function startEdit(p) {
  document.getElementById("profile-id").value = p.id;
  fields.forEach((f) => {
    document.getElementById(f).value = f === "skills" ? p.skills.join(", ") : p[f];
  });
  document.getElementById("profile-submit").textContent = "Save changes";
  document.getElementById("profile-cancel").hidden = false;
}

function resetForm() {
  form.reset();
  document.getElementById("profile-id").value = "";
  document.getElementById("profile-submit").textContent = "Add profile";
  document.getElementById("profile-cancel").hidden = true;
  showErrors({});
}

async function removeProfile(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    loadProfiles();
  } catch (err) {
    setMsg("Delete failed: " + err.message, false);
  }
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const data = readForm();
  const errors = validate(data);
  showErrors(errors);
  if (Object.keys(errors).length) return;

  const id = document.getElementById("profile-id").value;
  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) {
      if (body.fields) showErrors(body.fields);
      throw new Error(body.error || "HTTP " + res.status);
    }
    setMsg(id ? "Profile updated." : "Profile added.", true);
    resetForm();
    loadProfiles();
  } catch (err) {
    setMsg(err.message, false);
  }
});

document.getElementById("profile-cancel").onclick = resetForm;
loadProfiles();