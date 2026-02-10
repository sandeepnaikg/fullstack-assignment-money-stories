import requests
import sys
import json
import os
from datetime import datetime
from pathlib import Path

class ResearchPlatformAPITester:
    def __init__(self, base_url="https://docparser-14.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_health_check(self):
        """Test if backend is accessible"""
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=10)
            success = response.status_code == 200
            self.log_test("Backend Health Check", success, 
                         f"Status: {response.status_code}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Backend Health Check", False, str(e))
            return False

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/register", json=test_user)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.token = data.get('token')
                self.user_id = data.get('user', {}).get('id')
                self.test_email = test_user['email']
                self.test_password = test_user['password']
                
            self.log_test("User Registration", success, 
                         f"Status: {response.status_code}, Response: {response.text[:200]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("User Registration", False, str(e))
            return False

    def test_login(self):
        """Test user login"""
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No test user created")
            return False
            
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/login", json=login_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.token = data.get('token')
                
            self.log_test("User Login", success, 
                         f"Status: {response.status_code}, Response: {response.text[:200]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("User Login", False, str(e))
            return False

    def test_get_me(self):
        """Test get current user"""
        if not self.token:
            self.log_test("Get Current User", False, "No auth token")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(f"{self.api_url}/auth/me", headers=headers)
            success = response.status_code == 200
            
            self.log_test("Get Current User", success, 
                         f"Status: {response.status_code}, Response: {response.text[:200]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Get Current User", False, str(e))
            return False

    def create_test_pdf(self):
        """Create a simple test PDF file"""
        try:
            # Create a simple text file that we'll treat as PDF for testing
            test_content = """Test Research Document
            
This is a test document for the research platform.
It contains sample text for testing PDF processing capabilities.

Company: Test Corp
Industry: Technology
Pages: 1

This document is used for automated testing purposes."""
            
            test_file_path = Path("/tmp/test_document.pdf")
            with open(test_file_path, 'w') as f:
                f.write(test_content)
            
            return test_file_path
        except Exception as e:
            print(f"Failed to create test PDF: {e}")
            return None

    def test_document_upload(self):
        """Test document upload"""
        if not self.token:
            self.log_test("Document Upload", False, "No auth token")
            return False, None
            
        # Create test file
        test_file = self.create_test_pdf()
        if not test_file:
            self.log_test("Document Upload", False, "Could not create test file")
            return False, None
            
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            
            # Note: This will likely fail because we're not uploading a real PDF
            # but we want to test the endpoint response
            with open(test_file, 'rb') as f:
                files = {'file': ('test_document.pdf', f, 'application/pdf')}
                data = {
                    'title': 'Test Research Document',
                    'company': 'Test Corp',
                    'industry': 'Technology'
                }
                response = requests.post(f"{self.api_url}/documents/upload", 
                                       headers=headers, files=files, data=data)
            
            # Clean up test file
            test_file.unlink()
            
            success = response.status_code == 200
            document_id = None
            
            if success:
                doc_data = response.json()
                document_id = doc_data.get('id')
                
            self.log_test("Document Upload", success, 
                         f"Status: {response.status_code}, Response: {response.text[:300]}" if not success else "")
            return success, document_id
        except Exception as e:
            self.log_test("Document Upload", False, str(e))
            return False, None

    def test_get_documents(self):
        """Test get documents list"""
        if not self.token:
            self.log_test("Get Documents", False, "No auth token")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(f"{self.api_url}/documents", headers=headers)
            success = response.status_code == 200
            
            self.log_test("Get Documents", success, 
                         f"Status: {response.status_code}, Response: {response.text[:200]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Get Documents", False, str(e))
            return False

    def test_search_documents(self):
        """Test document search"""
        if not self.token:
            self.log_test("Search Documents", False, "No auth token")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
            search_data = {
                "query": "test",
                "company": "Test Corp"
            }
            response = requests.post(f"{self.api_url}/documents/search", 
                                   headers=headers, json=search_data)
            success = response.status_code == 200
            
            self.log_test("Search Documents", success, 
                         f"Status: {response.status_code}, Response: {response.text[:200]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Search Documents", False, str(e))
            return False

    def test_analytics_stats(self):
        """Test analytics stats endpoint"""
        if not self.token:
            self.log_test("Analytics Stats", False, "No auth token")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(f"{self.api_url}/analytics/stats", headers=headers)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Verify expected fields
                expected_fields = ['total_documents', 'total_pages', 'total_companies', 'total_queries']
                has_fields = all(field in data for field in expected_fields)
                if not has_fields:
                    success = False
                    
            self.log_test("Analytics Stats", success, 
                         f"Status: {response.status_code}, Response: {response.text[:200]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Analytics Stats", False, str(e))
            return False

    def test_analytics_recent(self):
        """Test recent activity endpoint"""
        if not self.token:
            self.log_test("Analytics Recent", False, "No auth token")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(f"{self.api_url}/analytics/recent", headers=headers)
            success = response.status_code == 200
            
            self.log_test("Analytics Recent", success, 
                         f"Status: {response.status_code}, Response: {response.text[:200]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("Analytics Recent", False, str(e))
            return False

    def test_chat_ask(self, document_id):
        """Test AI chat functionality"""
        if not self.token or not document_id:
            self.log_test("AI Chat Ask", False, "No auth token or document ID")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
            chat_data = {
                "document_id": document_id,
                "question": "What is this document about?"
            }
            response = requests.post(f"{self.api_url}/chat/ask", 
                                   headers=headers, json=chat_data)
            success = response.status_code == 200
            
            self.log_test("AI Chat Ask", success, 
                         f"Status: {response.status_code}, Response: {response.text[:300]}" if not success else "")
            return success
        except Exception as e:
            self.log_test("AI Chat Ask", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Research Platform API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Backend not accessible, stopping tests")
            return self.get_results()
        
        # Authentication flow
        if not self.test_register():
            print("❌ Registration failed, stopping tests")
            return self.get_results()
            
        if not self.test_login():
            print("❌ Login failed, stopping tests")
            return self.get_results()
            
        self.test_get_me()
        
        # Document management
        upload_success, doc_id = self.test_document_upload()
        self.test_get_documents()
        self.test_search_documents()
        
        # AI functionality (only if document upload succeeded)
        if upload_success and doc_id:
            self.test_chat_ask(doc_id)
        
        # Analytics
        self.test_analytics_stats()
        self.test_analytics_recent()
        
        return self.get_results()

    def get_results(self):
        """Get test results summary"""
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed - check details above")
            
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "details": self.test_results
        }

def main():
    tester = ResearchPlatformAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["passed_tests"] == results["total_tests"] else 1

if __name__ == "__main__":
    sys.exit(main())