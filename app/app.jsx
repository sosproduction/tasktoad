/* eslint-disable no-shadow */
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import { connect } from 'react-redux';
import {
    TaskItem,
    AddTaskForm,
    AddProject,
    ProjectSelector,
} from './components';
// Task actions
import {
    createTask,
    markDone,
    deleteTask,
    addTagToTask,
    removeTagFromTask,
} from './actions';
// Project actions
import {
    selectProject,
    createProject,
    deleteProject
} from './actions';
import {
    tasks,
    project,
    projects,
} from './selectors';

class App extends PureComponent {
    render() {
        const props = this.props;

        const {
            tasks,
            projects,
            selectedProject,
            selectProject,
            createProject,
            deleteProject,
            createTask,
            markDone,
            deleteTask,
            addTagToTask,
            removeTagFromTask,
        } = props;

        console.log('Props received by App component:', props);

        const taskItems = tasks.map(task => {
            return (
                <TaskItem key={task.id}
                          tags={task.tags}
                          done={task.done}
                          onAddTag={addTagToTask.bind(null, task.id)}
                          onRemoveTag={removeTagFromTask.bind(null, task.id)}
                          onMarkDone={markDone.bind(null, task.id)}
                          onDelete={deleteTask.bind(null, task.id)}>
                    {task.text}
                </TaskItem>
            );
        });

        const projectChoices = projects.map(project => {
            return <option key={project.id} value={project.id}>{project.name}</option>;
        });

        const onProjectSelect = projectId => {
            selectProject(projectId);
        };

        const onCreate = ({ text, tags }) => createTask({ text, tags, project: selectedProject.id});

        const onProjectCreate = (text) => createProject(text);

        const onProjectDelete = (text) => deleteProject(text);

        return (
            <div>
                <h2>Tasks for {selectedProject.name}</h2>
                <AddProject onSubmit={onProjectCreate}/>
                <ProjectSelector onSelect={onProjectSelect}>
                    {projectChoices}
                </ProjectSelector>
                <ul className="list-group">
                    {taskItems}
                </ul>
                <h2>Add Task for {selectedProject.name}</h2>
                <AddTaskForm onSubmit={onCreate}/>
            </div>
        );
    }
}

App.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedProject: PropTypes.object.isRequired,
    createProject: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
    selectProject: PropTypes.func.isRequired,
    createTask: PropTypes.func.isRequired,
    markDone: PropTypes.func.isRequired,
    deleteTask: PropTypes.func.isRequired,
    addTagToTask: PropTypes.func.isRequired,
    removeTagFromTask: PropTypes.func.isRequired,
};

// This function takes the Redux state, runs the
// selectors and returns the props passed to App.
function stateToProps(state) {
    return {
        tasks: tasks(state),
        selectedProject: project(state),
        projects: projects(state),
    };
}

// This maps our action creators to props and binds
// them to dispatch.
const dispatchToProps = {
    selectProject,
    createProject,
    deleteProject,
    createTask,
    markDone,
    deleteTask,
    addTagToTask,
    removeTagFromTask,
};

export default connect(stateToProps, dispatchToProps)(App);
