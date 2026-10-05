const skillList = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "SQL",
  "Node.js",
  "React",
  "Angular",
  "Vue",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Git",
  "Docker",
  "AWS",
  "Linux",
  "REST APIs",
  "Testing",
  "UX/UI",
  "Algorithms",
  "Data Structures"
];

const skillStatus = document.getElementById("skill-status");
const skillResults = document.getElementById("skill-results");

function searchSkills(query) {
  skillResults.innerHTML = "";
  skillStatus.className = "";

  const normalizedQuery = query.trim().toLowerCase();
  const matches = skillList.filter((skill) =>
    skill.toLowerCase().includes(normalizedQuery)
  );

  if (!normalizedQuery) {
    skillStatus.className = "error";
    skillStatus.textContent = "Please enter a skill.";
    return;
  }

  if (matches.length === 0) {
    skillStatus.className = "error";
    skillStatus.textContent = "No matching skills found.";
    return;
  }

  matches.forEach((skill) => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = skill;
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add skill";
    addButton.addEventListener("click", () => addSkill(skill));
    li.append(name, addButton);
    skillResults.appendChild(li);
  });

  skillStatus.textContent = `${matches.length} result(s).`;
}

function addSkill(skill) {
  const skillsInput = document.getElementById("skills");
  const skills = skillsInput.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
    skillStatus.className = "";
    skillStatus.textContent = `${skill} is already in the profile.`;
    return;
  }

  skills.push(skill);
  skillsInput.value = skills.join(", ");
  skillStatus.className = "ok";
  skillStatus.textContent = `Added ${skill} to profile skills.`;
}

function handleSkillSearch(event) {
  event.preventDefault();
  const query = document.getElementById("skill-query").value;
  searchSkills(query);
}

document.getElementById("skill-search-button").addEventListener("click", handleSkillSearch);
document.getElementById("skill-query").addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSkillSearch(event);
});
