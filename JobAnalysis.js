document.getElementById('file-input').addEventListener('change', handleFileUpload);
document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('sort-by').addEventListener('change', applyFilters);
document.getElementById('sort-order').addEventListener('change', applyFilters);
document.getElementById('search-input').addEventListener('input', applyFilters);

let jobData = [];

class Job {
    constructor(jobNo, title, jobPageLink, posted, type, level, estimatedTime, skill, detail) {
        this.jobNo = jobNo;
        this.title = title;
        this.jobPageLink = jobPageLink;
        this.posted = posted;
        this.type = type;
        this.level = level;
        this.estimatedTime = estimatedTime;
        this.skill = skill;
        this.detail = detail;
    }

    getDetails() {
        return `${this.title} - ${this.type} - ${this.level} - ${this.skill}`;
    }

    getFormattedPostedTime() {
        return this.posted;
    }

    getFullDetails() {
        return `
            <h3>${this.title}</h3>
            <p><strong>Posted Time:</strong> ${this.getFormattedPostedTime()}</p>
            <p><strong>Type:</strong> ${this.type}</p>
            <p><strong>Level:</strong> ${this.level}</p>
            <p><strong>Estimated Time:</strong> ${this.estimatedTime}</p>
            <p><strong>Skill:</strong> ${this.skill}</p>
            <p><strong>Detail:</strong> ${this.detail}</p>
            <p><a href="${this.jobPageLink}" target="_blank">Job Page Link</a></p>
        `;
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                jobData = JSON.parse(e.target.result).map(job => {
                    if (!job["Job No"] || !job["Title"] || !job["Job Page Link"] || !job["Posted"] || !job["Type"] || !job["Level"] || !job["Estimated Time"] || !job["Skill"] || !job["Detail"]) {
                        throw new Error('Missing fields in job data');
                    }
                    return new Job(
                        job["Job No"],
                        job["Title"],
                        job["Job Page Link"],
                        job["Posted"],
                        job["Type"],
                        job["Level"],
                        job["Estimated Time"],
                        job["Skill"],
                        job["Detail"]
                    );
                });
                populateFilters();
                applyFilters();
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Invalid JSON file or missing fields in job data');
            }
        };
        reader.readAsText(file);
    }
}

function populateFilters() {
    const levels = [...new Set(jobData.map(job => job.level))];
    const types = [...new Set(jobData.map(job => job.type))];
    const skills = [...new Set(jobData.map(job => job.skill))];

    populateSelect('job-level', levels);
    populateSelect('job-type', types);
    populateSelect('job-skill', skills);
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">All</option>';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        select.appendChild(opt);
    });
}

function applyFilters() {
    const level = document.getElementById('job-level').value;
    const type = document.getElementById('job-type').value;
    const skill = document.getElementById('job-skill').value;
    const sortBy = document.getElementById('sort-by').value;
    const sortOrder = document.getElementById('sort-order').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    let filteredJobs = jobData.filter(job => {
        return (!level || job.level === level) &&
               (!type || job.type === type) &&
               (!skill || job.skill === skill) &&
               (job.title.toLowerCase().includes(searchQuery) || job.detail.toLowerCase().includes(searchQuery));
    });

    if (sortBy === 'title') {
        filteredJobs.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });
    } else if (sortBy === 'postedTime') {
        filteredJobs.sort((a, b) => {
            if (sortOrder === 'asc') {
                return new Date(a.posted) - new Date(b.posted);
            } else {
                return new Date(b.posted) - new Date(a.posted);
            }
        });
    }

    displayJobs(filteredJobs);
}

function displayJobs(jobs) {
    const jobList = document.getElementById('job-list');
    jobList.innerHTML = '';
    jobs.forEach(job => {
        const li = document.createElement('li');
        li.textContent = job.getDetails();
        li.addEventListener('click', () => showJobDetails(job));
        jobList.appendChild(li);
    });
}

function showJobDetails(job) {
    const modal = document.getElementById('job-modal');
    const jobDetails = document.getElementById('job-details');
    jobDetails.innerHTML = job.getFullDetails();
    modal.style.display = 'block';

    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}