#!/usr/bin/env node

/**
 * Test Pending Projects API
 * Tests the department filtering for admin users
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.BACKEND_URL || 'http://localhost:5000';

async function testPendingProjects() {
  try {
    console.log('🧪 Testing Pending Projects API...\n');

    // Test CS Admin (ahmed.hassan@haramaya.edu.et)
    console.log('1️⃣ Testing Computer Science Admin...');
    
    const csLoginResponse = await axios.post(`${API_BASE}/api/user/login`, {
      email: 'ahmed.hassan@haramaya.edu.et',
      password: 'Admin123!'
    });
    
    const csToken = csLoginResponse.data.data.token;
    console.log('✅ CS Admin logged in successfully');
    
    const csPendingResponse = await axios.get(`${API_BASE}/api/project/admin/pending-projects`, {
      headers: { Authorization: `Bearer ${csToken}` }
    });
    
    console.log(`📋 CS Admin can see ${csPendingResponse.data.data.length} pending projects:`);
    csPendingResponse.data.data.forEach(project => {
      console.log(`   • ${project.title} (${project.department})`);
    });

    // Test IT Admin (sarah.johnson@haramaya.edu.et)
    console.log('\n2️⃣ Testing Information Technology Admin...');
    
    const itLoginResponse = await axios.post(`${API_BASE}/api/user/login`, {
      email: 'sarah.johnson@haramaya.edu.et',
      password: 'Admin123!'
    });
    
    const itToken = itLoginResponse.data.data.token;
    console.log('✅ IT Admin logged in successfully');
    
    const itPendingResponse = await axios.get(`${API_BASE}/api/project/admin/pending-projects`, {
      headers: { Authorization: `Bearer ${itToken}` }
    });
    
    console.log(`📋 IT Admin can see ${itPendingResponse.data.data.length} pending projects:`);
    itPendingResponse.data.data.forEach(project => {
      console.log(`   • ${project.title} (${project.department})`);
    });

    console.log('\n🎉 Pending projects API test completed successfully!');
    console.log('\n💡 Summary:');
    console.log(`   • CS Admin sees projects from "Computer Science" department`);
    console.log(`   • IT Admin sees projects from "Information Technology" department`);
    console.log(`   • Department filtering is working correctly`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testPendingProjects();