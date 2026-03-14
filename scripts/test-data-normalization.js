#!/usr/bin/env node

/**
 * Test script to verify experience and education data extraction
 * This script simulates various LinkedIn data formats to test the normalization
 */

// Since this is a TypeScript project, we'll create a simple test without imports
// Instead, we'll test the logic directly

// Test cases for different LinkedIn data formats
const testCases = [
  {
    name: 'Standard LinkedIn format',
    data: {
      name: 'John Doe',
      headline: 'Software Engineer at Tech Company',
      location: 'San Francisco, CA',
      about: 'Experienced software engineer with expertise in web development.',
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Company',
          duration: 'Jan 2020 - Present',
          description: 'Led development of web applications'
        },
        {
          title: 'Software Engineer',
          company: 'Startup Inc',
          duration: 'Jun 2018 - Dec 2019',
          description: 'Developed REST APIs and frontend components'
        }
      ],
      education: [
        {
          school: 'University of California',
          degree: 'Bachelor of Science in Computer Science',
          duration: '2014 - 2018'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js'],
      url: 'https://linkedin.com/in/johndoe'
    }
  },
  {
    name: 'Alternative field names',
    data: {
      name: 'Jane Smith',
      headline: 'Product Manager | Innovation',
      location: 'New York, NY',
      summary: 'Product manager with 5+ years of experience',
      positions: [
        {
          role: 'Senior Product Manager',
          organization: 'Innovation Corp',
          tenure: '2019 - Present',
          responsibilities: 'Led product strategy and roadmap'
        }
      ],
      schools: [
        {
          university: 'NYU',
          major: 'Business Administration',
          time_period: '2015 - 2019'
        }
      ],
      url: 'https://linkedin.com/in/janesmith'
    }
  },
  {
    name: 'Nested data structure',
    data: {
      name: 'Bob Johnson',
      headline: 'Data Scientist',
      location: 'Boston, MA',
      profile: {
        experience: [
          {
            title: 'Data Scientist',
            company: 'Analytics Co',
            duration: '2021 - Present',
            description: 'Machine learning and data analysis'
          }
        ],
        education: [
          {
            school: 'MIT',
            degree: 'Master of Science in Data Science',
            duration: '2019 - 2021'
          }
        ]
      },
      url: 'https://linkedin.com/in/bobjohnson'
    }
  },
  {
    name: 'String format data',
    data: {
      name: 'Alice Wilson',
      headline: 'Marketing Manager',
      location: 'Chicago, IL',
      experience_text: 'Marketing Agency - Marketing Manager (2020-Present), Startup Co - Marketing Specialist (2018-2020)',
      academic_background: 'University of Illinois - MBA (2016-2018), State College - Bachelor of Marketing (2012-2016)',
      url: 'https://linkedin.com/in/alicewilson'
    }
  },
  {
    name: 'Minimal data',
    data: {
      name: 'Charlie Brown',
      headline: 'Developer',
      location: 'Seattle, WA',
      url: 'https://linkedin.com/in/charliebrown'
    }
  }
];

async function runTests() {
  console.log('🧪 Testing LinkedIn data normalization...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 Test ${i + 1}: ${testCase.name}`);
    console.log('=' .repeat(50));
    
    try {
      const normalized = normalizeLinkedInData(testCase.data);
      
      console.log(`✅ Name: ${normalized.name}`);
      console.log(`✅ Headline: ${normalized.headline}`);
      console.log(`✅ Location: ${normalized.location}`);
      console.log(`✅ Experience: ${normalized.experience.length} items`);
      normalized.experience.forEach((exp, index) => {
        console.log(`   ${index + 1}. ${exp.title} at ${exp.company} (${exp.duration})`);
      });
      console.log(`✅ Education: ${normalized.education.length} items`);
      normalized.education.forEach((edu, index) => {
        console.log(`   ${index + 1}. ${edu.degree} from ${edu.school} (${edu.duration})`);
      });
      console.log(`✅ Skills: ${normalized.skills.length} items`);
      console.log(`✅ Projects: ${normalized.projects.length} items`);
      console.log(`✅ Certifications: ${normalized.certifications.length} items`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '=' .repeat(50) + '\n');
  }
  
  console.log('🎉 Testing complete!');
}

// Run the tests
runTests().catch(console.error);
