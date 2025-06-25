import { TestHelper } from '../../helper';
import * as vscode from 'vscode';
import * as assert from 'assert';

suite('Smoke Tests', () => {  
  test('Extension loads and activates without errors', async () => {
    const extensionId = TestHelper.getExtensionId();
    const extension = vscode.extensions.getExtension(extensionId);
    assert.ok(extension, 'Extension should be installed');
    
    if (!extension.isActive) {
      await extension.activate();
    }
    
    assert.ok(extension.isActive, 'Extension should activate successfully');
  });

  test('Client starts', async function() {
    const extensionId = TestHelper.getExtensionId();
    await TestHelper.waitForExtensionActivation(extensionId);
    
    const client = await TestHelper.waitForLanguageClient(extensionId);
    
    assert.ok(client, 'Language client should be available');
    assert.ok(client.isRunning(), 'Client should be running');
  });
});
