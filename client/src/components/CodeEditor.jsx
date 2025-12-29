import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({
    value,
    onChange,
    language = 'javascript',
    theme = 'vs-dark',
    height = '400px',
    readOnly = false
}) => {

    function handleEditorChange(value, event) {
        onChange(value);
    }

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden shadow-lg">
            <Editor
                height={height}
                defaultLanguage={language}
                value={value}
                theme={theme}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    readOnly: readOnly,
                    padding: { top: 16 }
                }}
            />
        </div>
    );
};

export default CodeEditor;
