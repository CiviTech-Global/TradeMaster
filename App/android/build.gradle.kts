allprojects {
    repositories {
        google()
        mavenCentral()
    }

    // Force all subprojects (including plugins) to use the same AGP version
    // as the app, since flutter_plugin_android_lifecycle 2.0.34 requests
    // AGP 8.13.1 which does not exist on Google Maven.
    buildscript {
        configurations.all {
            resolutionStrategy {
                eachDependency {
                    if (requested.group == "com.android.tools.build" && requested.name == "gradle") {
                        useVersion("8.11.1")
                    }
                }
            }
        }
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
