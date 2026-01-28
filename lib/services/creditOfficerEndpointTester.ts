/**
 * Credit Officer Endpoint Tester
 * Utility to test and discover credit officer specific API endpoints
 */

import apiClient from '@/lib/apiClient';

export interface EndpointTestResult {
  endpoint: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  responseStructure?: string[];
  sampleData?: Record<string, unknown>;
}

export class CreditOfficerEndpointTester {
  /**
   * Test multiple potential credit officer endpoints
   */
  static async testCreditOfficerEndpoints(creditOfficerId: string): Promise<EndpointTestResult[]> {
    const potentialEndpoints = [
      // Direct credit officer endpoints
      `/credit-officers/${creditOfficerId}`,
      `/credit-officers/${creditOfficerId}/stats`,
      `/credit-officers/${creditOfficerId}/statistics`,
      `/credit-officers/${creditOfficerId}/customers`,
      `/credit-officers/${creditOfficerId}/loans`,
      `/credit-officers/${creditOfficerId}/transactions`,
      `/credit-officers/${creditOfficerId}/data`,
      
      // Admin credit officer endpoints
      `/admin/credit-officers/${creditOfficerId}`,
      `/admin/credit-officers/${creditOfficerId}/stats`,
      `/admin/credit-officers/${creditOfficerId}/statistics`,
      `/admin/credit-officers/${creditOfficerId}/data`,
      `/admin/credit-officers/${creditOfficerId}/customers`,
      `/admin/credit-officers/${creditOfficerId}/loans`,
      
      // User-based endpoints with credit officer context
      `/admin/users/${creditOfficerId}/statistics`,
      `/admin/users/${creditOfficerId}/managed-data`,
      `/admin/users/${creditOfficerId}/customers`,
      `/admin/users/${creditOfficerId}/loans`,
      `/admin/users/${creditOfficerId}/performance`,
      
      // Filtered endpoints with credit officer parameter
      `/loans/all?creditOfficerId=${creditOfficerId}`,
      `/loans/all?credit_officer_id=${creditOfficerId}`,
      `/loans/all?assignedTo=${creditOfficerId}`,
      `/loans/all?managedBy=${creditOfficerId}`,
      `/loans/all?createdBy=${creditOfficerId}`,
      
      `/customers/all?creditOfficerId=${creditOfficerId}`,
      `/customers/all?credit_officer_id=${creditOfficerId}`,
      `/customers/all?assignedTo=${creditOfficerId}`,
      `/customers/all?managedBy=${creditOfficerId}`,
      
      `/admin/users?creditOfficerId=${creditOfficerId}`,
      `/admin/users?role=customer&creditOfficerId=${creditOfficerId}`,
      `/admin/users?role=customer&assignedTo=${creditOfficerId}`,
      
      `/savings/transactions/all?creditOfficerId=${creditOfficerId}`,
      `/savings/transactions/all?credit_officer_id=${creditOfficerId}`,
      
      // Reports endpoints with credit officer filter
      `/reports?creditOfficerId=${creditOfficerId}`,
      `/reports?submittedBy=${creditOfficerId}`,
      
      // Dashboard endpoints with credit officer context
      `/dashboard/kpi?creditOfficerId=${creditOfficerId}`,
      `/dashboard/credit-officer/${creditOfficerId}`,
      `/dashboard/credit-officer/${creditOfficerId}/stats`,
    ];

    const results: EndpointTestResult[] = [];

    console.log(`[CreditOfficerEndpointTester] Testing ${potentialEndpoints.length} potential endpoints for credit officer ${creditOfficerId}`);

    for (const endpoint of potentialEndpoints) {
      const result = await this.testSingleEndpoint(endpoint);
      results.push(result);
      
      // Log successful endpoints immediately
      if (result.success) {
        console.log(`[CreditOfficerEndpointTester] ✅ FOUND WORKING ENDPOINT: ${endpoint}`);
        console.log(`[CreditOfficerEndpointTester] Response structure:`, result.responseStructure);
      }
    }

    // Summary
    const successfulEndpoints = results.filter(r => r.success);
    const failedEndpoints = results.filter(r => !r.success);

    console.log(`[CreditOfficerEndpointTester] SUMMARY:`);
    console.log(`[CreditOfficerEndpointTester] ✅ Successful: ${successfulEndpoints.length}`);
    console.log(`[CreditOfficerEndpointTester] ❌ Failed: ${failedEndpoints.length}`);

    if (successfulEndpoints.length > 0) {
      console.log(`[CreditOfficerEndpointTester] 🎉 WORKING ENDPOINTS FOUND:`);
      successfulEndpoints.forEach(result => {
        console.log(`[CreditOfficerEndpointTester]   - ${result.endpoint}`);
      });
    }

    return results;
  }

  /**
   * Test a single endpoint
   */
  private static async testSingleEndpoint(endpoint: string): Promise<EndpointTestResult> {
    try {
      console.log(`[CreditOfficerEndpointTester] Testing: ${endpoint}`);
      
      const response = await apiClient.get(endpoint);
      
      if (response && typeof response === 'object') {
        const responseKeys = Object.keys(response);
        const sampleData = this.extractSampleData(response);
        
        return {
          endpoint,
          success: true,
          statusCode: 200,
          responseStructure: responseKeys,
          sampleData
        };
      } else {
        return {
          endpoint,
          success: false,
          error: 'Invalid response format'
        };
      }
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const statusCode = this.extractStatusCode(error);
      
      return {
        endpoint,
        success: false,
        statusCode,
        error: errorMessage
      };
    }
  }

  /**
   * Extract sample data from response for analysis
   */
  private static extractSampleData(response: Record<string, unknown>): Record<string, unknown> {
    const sample: Record<string, unknown> = {};
    
    // Extract key information for analysis
    Object.keys(response).forEach(key => {
      const value = response[key];
      
      if (Array.isArray(value)) {
        sample[key] = {
          type: 'array',
          length: value.length,
          firstItem: value.length > 0 ? this.summarizeObject(value[0]) : null
        };
      } else if (typeof value === 'object' && value !== null) {
        sample[key] = {
          type: 'object',
          keys: Object.keys(value)
        };
      } else {
        sample[key] = {
          type: typeof value,
          value: typeof value === 'string' && value.length > 50 ? 
                 `${value.substring(0, 50)}...` : value
        };
      }
    });
    
    return sample;
  }

  /**
   * Summarize an object for sample data
   */
  private static summarizeObject(obj: unknown): Record<string, unknown> | null {
    if (!obj || typeof obj !== 'object') {
      return null;
    }
    
    const summary: Record<string, unknown> = {};
    const objRecord = obj as Record<string, unknown>;
    
    // Get first few keys for summary
    Object.keys(objRecord).slice(0, 5).forEach(key => {
      const value = objRecord[key];
      summary[key] = typeof value === 'string' && value.length > 30 ? 
                    `${value.substring(0, 30)}...` : value;
    });
    
    return summary;
  }

  /**
   * Extract status code from error
   */
  private static extractStatusCode(error: unknown): number | undefined {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      
      // Try different ways to extract status code
      if (typeof errorObj.status === 'number') {
        return errorObj.status;
      }
      if (typeof errorObj.statusCode === 'number') {
        return errorObj.statusCode;
      }
      if (errorObj.response && typeof errorObj.response === 'object') {
        const response = errorObj.response as Record<string, unknown>;
        if (typeof response.status === 'number') {
          return response.status;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Generate a test report
   */
  static generateTestReport(results: EndpointTestResult[]): string {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    let report = `# Credit Officer Endpoint Test Report\n\n`;
    report += `**Total Endpoints Tested:** ${results.length}\n`;
    report += `**Successful:** ${successful.length}\n`;
    report += `**Failed:** ${failed.length}\n\n`;
    
    if (successful.length > 0) {
      report += `## ✅ Working Endpoints\n\n`;
      successful.forEach(result => {
        report += `### ${result.endpoint}\n`;
        report += `- **Status:** Success\n`;
        report += `- **Response Structure:** ${result.responseStructure?.join(', ')}\n`;
        if (result.sampleData) {
          report += `- **Sample Data Keys:** ${Object.keys(result.sampleData).join(', ')}\n`;
        }
        report += `\n`;
      });
    }
    
    if (failed.length > 0) {
      report += `## ❌ Failed Endpoints\n\n`;
      
      // Group by status code
      const groupedByStatus: Record<string, EndpointTestResult[]> = {};
      failed.forEach(result => {
        const status = result.statusCode?.toString() || 'unknown';
        if (!groupedByStatus[status]) {
          groupedByStatus[status] = [];
        }
        groupedByStatus[status].push(result);
      });
      
      Object.keys(groupedByStatus).forEach(status => {
        report += `### Status Code: ${status}\n`;
        groupedByStatus[status].forEach(result => {
          report += `- ${result.endpoint}\n`;
        });
        report += `\n`;
      });
    }
    
    return report;
  }
}